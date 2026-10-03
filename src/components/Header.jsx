import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          🔨 Los Maestros <small>FERRETERÍA</small>
        </Link>
        <nav className="nav">
          <Link to="/">Inicio</Link>
          <Link to="/catalogo">Catálogo</Link>
        </nav>
      </div>
    </header>
  )
}

export default Header
