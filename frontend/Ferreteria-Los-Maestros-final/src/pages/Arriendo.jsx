import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useShop } from '../context/ShopContext.jsx'
import { clp } from '../utils.js'

const today = () => new Date().toISOString().slice(0, 10)
const diffDays = (a, b) => Math.max(1, Math.round((new Date(b) - new Date(a)) / 86400000) + 1)

function Arriendo() {
  const { user } = useAuth()
  const { products, addRental } = useShop()
  const herramientas = products.filter((p) => p.category === 'herramientas')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    herramienta: '', inicio: '', devolucion: '', dias: 1, pago: 'efectivo', comentarios: '',
  })
  const [sent, setSent] = useState(false)

  function handleChange(e) {
    const next = { ...form, [e.target.name]: e.target.value }
    // Los días se calculan solos a partir de las fechas
    if (next.inicio && next.devolucion && next.devolucion >= next.inicio) {
      next.dias = diffDays(next.inicio, next.devolucion)
    }
    setForm(next)
    setSent(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (form.devolucion < form.inicio) {
      setError('La fecha de devolución no puede ser anterior al inicio.')
      return
    }
    const tool = herramientas.find((h) => String(h.id) === form.herramienta)
    addRental({
      user,
      tool,
      inicio: form.inicio,
      termino: form.devolucion,
      dias: Number(form.dias),
      pago: form.pago,
      deposito: tool.price * 2,
      costo: tool.price * Number(form.dias),
      comentarios: form.comentarios,
    })
    setError('')
    setSent(true)
    setForm({ herramienta: '', inicio: '', devolucion: '', dias: 1, pago: 'efectivo', comentarios: '' })
  }

  const herramientaSel = herramientas.find((h) => String(h.id) === form.herramienta)
  const deposito = herramientaSel ? herramientaSel.price * 2 : 0

  return (
    <div className="container py-4">
      <h1 className="h3 mb-4">Arriendo de herramientas</h1>

      {sent && <div className="alert alert-success">¡Solicitud de arriendo enviada! Te contactaremos para confirmar. <Link to="/historial">Ver en mi historial</Link></div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-lg-7">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Herramienta</label>
              <select className="form-select" name="herramienta" value={form.herramienta} onChange={handleChange} required>
                <option value="">Selecciona una herramienta</option>
                {herramientas.map((h) => (
                  <option key={h.id} value={h.id}>{h.name} — {clp(h.price)}/día</option>
                ))}
              </select>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold">Fecha de inicio</label>
                <input type="date" min={today()} className="form-control" name="inicio" value={form.inicio} onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold">Fecha de devolución</label>
                <input type="date" min={form.inicio || today()} className="form-control" name="devolucion" value={form.devolucion} onChange={handleChange} required />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold">Días de arriendo</label>
                <input type="number" className="form-control" name="dias" value={form.dias} disabled />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold">Forma de pago</label>
                <select className="form-select" name="pago" value={form.pago} onChange={handleChange}>
                  <option value="efectivo">Efectivo</option>
                  <option value="debito">Débito</option>
                  <option value="credito">Crédito</option>
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Depósito de garantía</label>
              <input className="form-control" value={clp(deposito)} disabled />
              {herramientaSel && <div className="form-text">Costo estimado: {clp(herramientaSel.price * form.dias)}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Comentarios adicionales</label>
              <textarea className="form-control" name="comentarios" rows="3" placeholder="Especificaciones especiales..." value={form.comentarios} onChange={handleChange}></textarea>
            </div>
            <button type="submit" className="btn text-white" style={{ background: 'var(--flm-orange)' }}>
              Solicitar arriendo
            </button>
          </form>
        </div>

        <div className="col-lg-5">
          <h6 className="fw-bold mb-3">Herramientas disponibles</h6>
          <div className="list-group">
            {herramientas.slice(0, 6).map((h) => (
              <div key={h.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span className="small">{h.name}</span>
                <span className="fw-semibold small">{clp(h.price)}/día</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Arriendo
