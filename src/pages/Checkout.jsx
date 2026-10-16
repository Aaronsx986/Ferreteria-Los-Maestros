import { useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import FormField from '../components/FormField.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useShop } from '../context/ShopContext.jsx'
import { REGIONES } from '../data/regiones.js'
import { procesarPago } from '../services/pago.js'
import { clp } from '../utils.js'
import { validateCheckout } from '../validations.js'

// Si hay sesión, el formulario se completa solo con los datos del usuario
function initialForm(user) {
  const [nombre, ...resto] = (user?.name || user?.username || '').split(' ')
  const ciudad = user?.address?.city || ''
  const region = Object.keys(REGIONES).find((r) => REGIONES[r].includes(ciudad)) || 'Región Metropolitana de Santiago'
  return {
    nombre,
    apellido: resto.join(' '),
    correo: user?.email || '',
    delivery: 'despacho',
    calle: user?.address?.street || '',
    departamento: '',
    region,
    comuna: REGIONES[region].includes(ciudad) ? ciudad : '',
    indicaciones: '',
    payment: 'debito',
    tarjeta: '',
  }
}

function Checkout() {
  const { user } = useAuth()
  const { items, total, clearCart } = useCart()
  const { placeOrder } = useShop()
  const navigate = useNavigate()
  const { state } = useLocation()
  // Al reintentar un pago fallido se recuperan los datos ya escritos (menos la tarjeta)
  const [form, setForm] = useState(() => ({ ...initialForm(user), ...state?.form }))
  const [errors, setErrors] = useState({})
  const terminado = useRef(false)

  // Sin productos no hay nada que pagar (salvo que la compra recién se haya completado)
  if (items.length === 0 && !terminado.current) return <Navigate to="/carrito" replace />

  function handleChange(e) {
    const { name, value } = e.target
    // Al cambiar de región, la comuna anterior deja de ser válida
    setForm((prev) => ({ ...prev, [name]: value, ...(name === 'region' ? { comuna: '' } : {}) }))
  }

  function fallar(motivo, datos) {
    navigate('/compra-fallida', {
      state: { motivo, form: datos, items, total, ref: `P-${String(Date.now()).slice(-6)}` },
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const found = validateCheckout(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    // El número de tarjeta se usa solo para el pago: nunca se guarda ni viaja a otras pantallas
    const { tarjeta, ...datos } = form
    const pago = procesarPago({ metodo: form.payment, monto: total, tarjeta })
    if (!pago.ok) return fallar(pago.motivo, datos)

    const result = placeOrder({
      user,
      items,
      payment: form.payment,
      delivery: form.delivery,
      shipping: datos,
    })
    if (!result.ok) return fallar(result.message, datos)

    terminado.current = true
    clearCart()
    navigate(`/compra-exitosa/${result.order.id}`, { replace: true })
  }

  const field = (name) => ({ name, value: form[name], onChange: handleChange, error: errors[name] })
  const despacho = form.delivery === 'despacho'
  const conTarjeta = form.payment === 'debito' || form.payment === 'credito'

  return (
    <div className="container py-4">
      <h1 className="h3 fw-bold mb-4">Finalizar compra</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card p-3 shadow-sm mb-3">
              <h2 className="h6 fw-bold">Información del cliente</h2>
              <p className="small text-muted">Completa la siguiente información.</p>
              <div className="row">
                <FormField label="Nombre" className="col-md-6" {...field('nombre')} />
                <FormField label="Apellido" className="col-md-6" {...field('apellido')} />
              </div>
              <FormField label="Correo electrónico" type="email" {...field('correo')} />
            </div>

            <div className="card p-3 shadow-sm">
              <h2 className="h6 fw-bold">Entrega de los productos</h2>
              <FormField label="Tipo de entrega" as="select" {...field('delivery')}>
                <option value="despacho">Despacho a domicilio</option>
                <option value="retiro">Retiro en tienda Santiago Centro</option>
              </FormField>

              {despacho && (
                <>
                  <div className="row">
                    <FormField label="Calle" className="col-md-8" placeholder="Ej: Los Alerces 123" {...field('calle')} />
                    <FormField label="Departamento (opcional)" className="col-md-4" placeholder="Ej: 603" {...field('departamento')} />
                  </div>
                  <div className="row">
                    <FormField label="Región" as="select" className="col-md-6" {...field('region')}>
                      {Object.keys(REGIONES).map((r) => <option key={r} value={r}>{r}</option>)}
                    </FormField>
                    <FormField label="Comuna" as="select" className="col-md-6" {...field('comuna')}>
                      <option value="">Selecciona...</option>
                      {(REGIONES[form.region] || []).map((c) => <option key={c} value={c}>{c}</option>)}
                    </FormField>
                  </div>
                  <FormField
                    label="Indicaciones para la entrega (opcional)"
                    as="textarea"
                    rows={2}
                    placeholder="Ej: Entre calles, color de la casa, no tiene timbre"
                    {...field('indicaciones')}
                  />
                </>
              )}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card p-3 shadow-sm">
              <h2 className="h6 fw-bold">Resumen del pedido</h2>
              <ul className="list-unstyled small mb-2">
                {items.map((it) => (
                  <li key={it.id} className="d-flex justify-content-between gap-2 py-1 border-bottom">
                    <span>{it.name} <span className="text-muted">x{it.qty}</span></span>
                    <span className="fw-semibold">{clp(it.price * it.qty)}</span>
                  </li>
                ))}
              </ul>

              <FormField label="Forma de pago" as="select" className="mt-2" {...field('payment')}>
                <option value="debito">Débito</option>
                <option value="credito">Crédito</option>
                <option value="transferencia">Transferencia</option>
                <option value="efectivo">Efectivo (al retirar)</option>
              </FormField>
              {conTarjeta && (
                <FormField
                  label="Número de tarjeta"
                  inputMode="numeric"
                  maxLength={19}
                  placeholder="1234 5678 9012 3456"
                  autoComplete="off"
                  {...field('tarjeta')}
                />
              )}

              <div className="d-flex justify-content-between align-items-center border-top pt-2">
                <span>Total a pagar</span>
                <span className="fs-4 fw-bold">{clp(total)}</span>
              </div>

              <button type="submit" className="btn btn-primary w-100 mt-3">
                <i className="bi bi-lock me-1"></i> Pagar ahora {clp(total)}
              </button>
              <Link to="/carrito" className="btn btn-link btn-sm w-100 mt-1">Volver al carrito</Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Checkout
