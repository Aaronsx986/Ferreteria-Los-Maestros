import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Dropdown from 'react-bootstrap/Dropdown'
import SearchForm from './SearchForm.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const urlQ = params.get('q') || ''
  const [q, setQ] = useState(urlQ)

  // Mantiene el buscador sincronizado con la URL (p. ej. al limpiar filtros)
  useEffect(() => setQ(urlQ), [urlQ])

  function handleSearch(e) {
    e.preventDefault()
    const term = q.trim()
    navigate(term ? `/catalogo?q=${encodeURIComponent(term)}` : '/catalogo')
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  const firstName = user ? (user.name ? user.name.split(' ')[0] : user.username) : 'Cuenta'

  return (
    <nav className="flm-navbar">
      <div className="container d-flex align-items-center gap-3 flex-wrap">
        <Link to="/" className="flm-logo text-decoration-none">
          <i className="bi bi-hammer"></i>
          <span>
            Los Maestros
            <small>FERRETERÍA</small>
          </span>
        </Link>

        <SearchForm
          className="d-none d-md-flex flex-grow-1"
          value={q}
          onChange={setQ}
          onSubmit={handleSearch}
          placeholder="Busca cemento, taladros, pintura, tornillos..."
        />

        <div className="ms-auto d-flex align-items-center gap-1">
          <Link to="/ofertas" className="flm-nav-icon-btn">
            <i className="bi bi-tag"></i>
            <span>Ofertas</span>
          </Link>

          <Link to="/historial" className="flm-nav-icon-btn">
            <i className="bi bi-clock-history"></i>
            <span>Historial</span>
          </Link>

          {user ? (
            <Dropdown align="end">
              <Dropdown.Toggle as="button" type="button" bsPrefix="flm-nav-icon-btn flm-acct-toggle">
                <i className="bi bi-person-check"></i>
                <span>{firstName}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu className="shadow-sm">
                <Dropdown.Header>{user.name || user.username}</Dropdown.Header>
                <Dropdown.Item as={Link} to="/historial">
                  <i className="bi bi-clock-history me-2"></i>Mi historial
                </Dropdown.Item>
                {isAdmin && (
                  <Dropdown.Item as={Link} to="/dashboard">
                    <i className="bi bi-speedometer2 me-2"></i>Panel admin
                  </Dropdown.Item>
                )}
                <Dropdown.Divider />
                <Dropdown.Item as="button" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>Cerrar sesión
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Link to="/login" className="flm-nav-icon-btn">
              <i className="bi bi-person"></i>
              <span>Cuenta</span>
            </Link>
          )}

          {isAdmin && (
            <Link to="/dashboard" className="flm-nav-icon-btn">
              <i className="bi bi-speedometer2"></i>
              <span>Admin</span>
            </Link>
          )}

          <Link to="/carrito" className="flm-nav-icon-btn">
            <i className="bi bi-cart3"></i>
            <span>Carrito</span>
            {count > 0 && <span className="badge-cart">{count}</span>}
          </Link>
        </div>
      </div>

      {/* Buscador móvil */}
      <div className="container d-md-none mt-2">
        <SearchForm
          className="d-flex"
          value={q}
          onChange={setQ}
          onSubmit={handleSearch}
          placeholder="Buscar productos..."
        />
      </div>
    </nav>
  )
}

export default Navbar
