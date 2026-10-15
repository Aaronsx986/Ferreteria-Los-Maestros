import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

function Header() {
  const { user, logout, isAdmin } = useAuth()
  const { count } = useCart()
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    if (!q.trim()) return
    navigate('/catalogo?q=' + encodeURIComponent(q.trim()))
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: 'var(--flm-dark)' }}>
      <div className="container">
        <Link to="/" className="navbar-brand fw-bold">
          <i className="bi bi-bricks me-1"></i> Los Maestros
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#flmNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="flmNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><Link className="nav-link" to="/">Inicio</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/catalogo">Catálogo</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/arriendo">Arriendo</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/reparacion">Servicio técnico</Link></li>
            {user && <li className="nav-item"><Link className="nav-link" to="/historial">Mi historial</Link></li>}
            {isAdmin && <li className="nav-item"><Link className="nav-link" to="/dashboard">Admin</Link></li>}
          </ul>

          <form className="d-flex me-2" onSubmit={handleSearch}>
            <input
              className="form-control form-control-sm"
              type="search"
              placeholder="Buscar productos..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </form>

          <Link to="/carrito" className="btn btn-sm btn-outline-light position-relative me-3">
            <i className="bi bi-cart3"></i>
            {count > 0 && (
              <span className="badge rounded-pill bg-warning text-dark position-absolute top-0 start-100 translate-middle">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="dropdown">
              <button className="btn btn-sm btn-light dropdown-toggle" data-bs-toggle="dropdown">
                {user.name ? user.name.split(' ')[0] : user.username}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><button className="dropdown-item" onClick={logout}>Cerrar sesión</button></li>
              </ul>
            </div>
          ) : (
            <Link to="/login" className="btn btn-sm btn-warning fw-semibold">Ingresar</Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Header
