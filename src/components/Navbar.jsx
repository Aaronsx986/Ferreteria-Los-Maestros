import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="flm-navbar">
      <div className="container d-flex align-items-center gap-3 flex-wrap">
        
        <Link to="/" className="flm-logo text-decoration-none">
          <i className="bi bi-hammer"></i>
          <span>Los Maestros<br /><small>FERRETERÍA</small></span>
        </Link>
        
        <form className="flm-search-form d-none d-md-flex flex-grow-1" id="navSearchForm">
          <input 
            type="search" 
            className="form-control" 
            name="q" 
            placeholder="Busca cemento, taladros, pintura, tornillos..." 
          />
          <button className="btn" type="submit">
            <i className="bi bi-search"></i>
          </button>
        </form>
        
        <div className="ms-auto d-flex align-items-center gap-1">
          <Link to="/historial" className="nav-link flm-nav-icon-btn px-2 text-center">
            <i className="bi bi-clock-history"></i><br />Historial
          </Link>
          <Link to="/login" className="nav-link flm-nav-icon-btn px-2 text-center">
            <i className="bi bi-person"></i><br /><span id="flmNavUserName">Cuenta</span>
          </Link>

          
          <Link to="/dashboard" className="nav-link flm-nav-icon-btn px-2 flm-admin-only d-none text-center">
            <i className="bi bi-speedometer2"></i><br />Admin
          </Link>
          <Link to="/carrito" className="nav-link flm-nav-icon-btn px-2 text-center">
            <i className="bi bi-cart3"></i><br />Carrito<span id="flmCartBadge" className="badge-cart">0</span>
          </Link>
        </div>
      </div>
      
      {/* Buscador Mobile */}
      <div className="container d-md-none mt-2">
        <form className="flm-search-form-mobile d-flex" id="navSearchFormMobile">
          <input 
            type="search" 
            className="form-control me-1" 
            name="q" 
            placeholder="Buscar productos..." 
          />
          <button className="btn btn-flm" type="submit">
            <i className="bi bi-search"></i>
          </button>
        </form>
      </div>
    </nav>
  );
}

export default Navbar;