import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useShop } from '../context/ShopContext.jsx'

function Reparacion() {
  const { user } = useAuth()
  const { addService } = useShop()
  const [form, setForm] = useState({
    tipo: '', marca: '', urgencia: 'normal', fecha: '', hora: '', descripcion: '',
  })
  const [sent, setSent] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    addService({ user, ...form })
    setForm({ tipo: '', marca: '', urgencia: 'normal', fecha: '', hora: '', descripcion: '' })
    setSent(true)
  }

  return (
    <div className="container py-4" style={{ maxWidth: 700 }}>
      <h1 className="h3 mb-4">Servicio técnico de herramientas</h1>

      {sent && <div className="alert alert-success">¡Solicitud de servicio enviada! Te contactaremos para coordinar. <Link to="/historial">Ver en mi historial</Link></div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label small fw-semibold">Tipo de herramienta</label>
            <input className="form-control" name="tipo" placeholder="Ej: Taladro, Sierra circular" value={form.tipo} onChange={handleChange} required />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label small fw-semibold">Marca y modelo</label>
            <input className="form-control" name="marca" placeholder="Ej: Makita HP1630" value={form.marca} onChange={handleChange} />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold d-block">Urgencia del servicio</label>
          {['baja', 'normal', 'alta'].map((u) => (
            <div className="form-check form-check-inline" key={u}>
              <input
                className="form-check-input"
                type="radio"
                name="urgencia"
                id={`urg-${u}`}
                value={u}
                checked={form.urgencia === u}
                onChange={handleChange}
              />
              <label className="form-check-label text-capitalize" htmlFor={`urg-${u}`}>{u}</label>
            </div>
          ))}
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label small fw-semibold">Fecha preferida</label>
            <input type="date" min={new Date().toISOString().slice(0, 10)} className="form-control" name="fecha" value={form.fecha} onChange={handleChange} required />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label small fw-semibold">Hora preferida</label>
            <input type="time" className="form-control" name="hora" value={form.hora} onChange={handleChange} required />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold">Descripción del problema</label>
          <textarea
            className="form-control"
            name="descripcion"
            rows="4"
            placeholder="Describe en detalle el problema..."
            value={form.descripcion}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <button type="submit" className="btn text-white" style={{ background: 'var(--flm-orange)' }}>
          Enviar solicitud
        </button>
      </form>
    </div>
  )
}

export default Reparacion
