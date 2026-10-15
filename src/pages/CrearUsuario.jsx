import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function CrearUsuario() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', username: '', email: '', phone: '', address: '', password: '', role: 'user',
  })
  const [sent, setSent] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    // Demo: no hay backend, solo simulamos la creación.
    setSent(true)
    setTimeout(() => navigate('/login'), 1500)
  }

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <h1 className="h3 mb-1">Crear usuario</h1>
      <p className="text-muted mb-4">Completa tus datos para registrarte</p>

      {sent && <div className="alert alert-success">Cuenta creada (demo). Redirigiendo a inicio de sesión...</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label small fw-semibold">Nombre completo</label>
          <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label small fw-semibold">Usuario</label>
            <input className="form-control" name="username" value={form.username} onChange={handleChange} required />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label small fw-semibold">Correo electrónico</label>
            <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label small fw-semibold">Teléfono</label>
            <input className="form-control" name="phone" placeholder="+56 9 1234 5678" value={form.phone} onChange={handleChange} />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label small fw-semibold">Rol</label>
            <select className="form-select" name="role" value={form.role} onChange={handleChange}>
              <option value="user">Cliente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label small fw-semibold">Dirección</label>
          <input className="form-control" name="address" placeholder="Calle, número, comuna" value={form.address} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-semibold">Contraseña</label>
          <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn w-100 text-white" style={{ background: 'var(--flm-orange)' }}>
          Crear cuenta
        </button>
      </form>
      <p className="text-center small mt-3">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  )
}

export default CrearUsuario
