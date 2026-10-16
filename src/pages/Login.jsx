import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const result = login(username, password)
    if (result.ok) {
      navigate(from, { replace: true })
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 420 }}>
      <h1 className="h3 mb-1">Bienvenido de nuevo</h1>
      <p className="text-muted mb-4">Ingresa a tu cuenta de Ferretería Los Maestros</p>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label small fw-semibold">Usuario</label>
          <input
            className="form-control"
            placeholder="admin o usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-semibold">Contraseña</label>
          <input
            type="password"
            className="form-control"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn w-100 text-white" style={{ background: 'var(--flm-orange)' }}>
          Ingresar
        </button>
      </form>

      <p className="text-center small text-muted mt-4">
        Prueba con <code>admin / admin123</code> o <code>usuario / user123</code>
      </p>
      <p className="text-center small">
        ¿No tienes cuenta? <Link to="/crear-usuario">Regístrate</Link>
      </p>
    </div>
  )
}

export default Login
