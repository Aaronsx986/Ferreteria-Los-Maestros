import { Fragment, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useShop } from '../context/ShopContext.jsx'
import { clp, formatDate } from '../utils.js'

const PAYMENT = { efectivo: 'Efectivo', debito: 'Débito', credito: 'Crédito', transferencia: 'Transferencia' }

const estadoClass = (e) =>
  ({ 'Listo para retiro': 'bg-success', 'En preparación': 'bg-info text-dark', Entregado: 'bg-success', Solicitado: 'bg-warning text-dark', Finalizado: 'bg-secondary' }[e] || 'bg-secondary')

function Empty({ children }) {
  return <div className="text-center text-muted py-4 bg-white border rounded">{children}</div>
}

function Historial() {
  const { user } = useAuth()
  const { orders, rentals, services } = useShop()
  const { state } = useLocation()
  const [open, setOpen] = useState(state?.newOrder || null)

  // Solo se muestra la actividad del usuario con sesión iniciada
  const compras = orders.filter((o) => o.username === user.username)
  const arriendos = rentals.filter((r) => r.username === user.username)
  const servicios = services.filter((s) => s.username === user.username)
  const totalGastado = compras.reduce((s, c) => s + c.total, 0)

  return (
    <div className="container py-4">
      <h1 className="h3 fw-bold mb-1">Mi historial</h1>
      <p className="text-muted mb-4">
        Hola {user?.name || user?.username}, aquí está tu actividad.
        {compras.length > 0 && <> Llevas {compras.length} {compras.length === 1 ? 'compra' : 'compras'} por {clp(totalGastado)}.</>}
      </p>

      {state?.newOrder && (
        <div className="alert alert-success">
          <i className="bi bi-check-circle me-2"></i>
          ¡Compra <strong>{state.newOrder}</strong> realizada con éxito! Quedó registrada en tu historial.
        </div>
      )}

      <h2 className="h6 fw-bold">Compras</h2>
      {compras.length === 0 ? (
        <Empty>
          Aún no tienes compras. <Link to="/catalogo">Ir al catálogo</Link>
        </Empty>
      ) : (
        <div className="table-responsive bg-white border rounded mb-4">
          <table className="table align-middle mb-0">
            <thead>
              <tr><th>ID Compra</th><th>Fecha</th><th>Producto(s)</th><th>Pago</th><th>Total</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              {compras.map((c) => {
                const isOpen = open === c.id
                const resumen = c.items.slice(0, 2).map((i) => `${i.name} x${i.qty}`).join(', ')
                return (
                  <Fragment key={c.id}>
                    <tr>
                      <td className="fw-semibold">{c.id}</td>
                      <td className="text-nowrap">{formatDate(c.fecha)}</td>
                      <td className="small">
                        {resumen}{c.items.length > 2 && <span className="text-muted"> y {c.items.length - 2} más</span>}
                      </td>
                      <td className="small">{PAYMENT[c.payment] || c.payment}</td>
                      <td className="fw-semibold">{clp(c.total)}</td>
                      <td><span className={`badge ${estadoClass(c.estado)}`}>{c.estado}</span></td>
                      <td>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setOpen(isOpen ? null : c.id)} aria-label="Ver detalle">
                          <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`}></i>
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={7} className="bg-light">
                          <div className="small text-muted mb-2">
                            {c.delivery === 'despacho' ? 'Despacho a domicilio' : 'Retiro en tienda Santiago Centro'}
                          </div>
                          {c.items.map((i) => (
                            <div key={i.id} className="d-flex align-items-center gap-2 mb-2">
                              <img src={i.imagen} alt="" className="flm-thumb" />
                              <div className="flex-grow-1 small">{i.name}</div>
                              <div className="small text-muted">{i.qty} x {clp(i.price)}</div>
                              <div className="small fw-semibold" style={{ minWidth: 90, textAlign: 'right' }}>{clp(i.qty * i.price)}</div>
                            </div>
                          ))}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="h6 fw-bold">Arriendos</h2>
      {arriendos.length === 0 ? (
        <div className="mb-4"><Empty>Sin arriendos. <Link to="/arriendo">Solicitar un arriendo</Link></Empty></div>
      ) : (
        <div className="table-responsive bg-white border rounded mb-4">
          <table className="table align-middle mb-0">
            <thead><tr><th>ID Arriendo</th><th>Herramienta</th><th>Inicio</th><th>Término</th><th>Costo</th><th>Estado</th></tr></thead>
            <tbody>
              {arriendos.map((a) => (
                <tr key={a.id}>
                  <td className="fw-semibold">{a.id}</td><td>{a.herramienta}</td><td>{formatDate(a.inicio)}</td><td>{formatDate(a.termino)}</td>
                  <td>{clp(a.costo)}</td>
                  <td><span className={`badge ${estadoClass(a.estado)}`}>{a.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="h6 fw-bold">Servicio técnico</h2>
      {servicios.length === 0 ? (
        <Empty>Sin solicitudes. <Link to="/reparacion">Pedir servicio técnico</Link></Empty>
      ) : (
        <div className="table-responsive bg-white border rounded">
          <table className="table align-middle mb-0">
            <thead><tr><th>ID Servicio</th><th>Servicio</th><th>Solicitado</th><th>Agendado</th><th>Estado</th></tr></thead>
            <tbody>
              {servicios.map((s) => (
                <tr key={s.id}>
                  <td className="fw-semibold">{s.id}</td><td>{s.servicio}</td><td>{formatDate(s.solicitado)}</td><td>{s.agendado}</td>
                  <td><span className={`badge ${estadoClass(s.estado)}`}>{s.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Historial
