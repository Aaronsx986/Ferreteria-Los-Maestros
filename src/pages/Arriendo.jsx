import { useState } from 'react'
import productsData from '../data/products.json'

const herramientas = productsData.products.filter((p) => p.category === 'herramientas')

function Arriendo() {
  const [form, setForm] = useState({
    herramienta: '', inicio: '', devolucion: '', dias: 1, pago: 'efectivo', comentarios: '',
  })
  const [sent, setSent] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true)
  }

  const herramientaSel = herramientas.find((h) => String(h.id) === form.herramienta)
  const deposito = herramientaSel ? herramientaSel.price * 2 : 0

  return (
    <div className="container py-4">
      <h1 className="h3 mb-4">Arriendo de herramientas</h1>

      {sent && <div className="alert alert-success">¡Solicitud de arriendo enviada! Te contactaremos para confirmar.</div>}

      <div className="row">
        <div className="col-lg-7">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Herramienta</label>
              <select className="form-select" name="herramienta" value={form.herramienta} onChange={handleChange} required>
                <option value="">Selecciona una herramienta</option>
                {herramientas.map((h) => (
                  <option key={h.id} value={h.id}>{h.name} — ${h.price.toLocaleString('es-CL')}/día</option>
                ))}
              </select>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold">Fecha de inicio</label>
                <input type="date" className="form-control" name="inicio" value={form.inicio} onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold">Fecha de devolución</label>
                <input type="date" className="form-control" name="devolucion" value={form.devolucion} onChange={handleChange} required />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold">Días de arriendo</label>
                <input type="number" min="1" className="form-control" name="dias" value={form.dias} onChange={handleChange} />
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
              <input className="form-control" value={`$${deposito.toLocaleString('es-CL')}`} disabled />
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
                <span className="fw-semibold small">${h.price.toLocaleString('es-CL')}/día</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Arriendo
