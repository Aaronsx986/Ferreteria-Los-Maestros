import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row text-start">
          <div className="col-md-4 mb-3">
            <h6 className="fw-bold text-white">
              <i className="bi bi-hammer me-1"></i> Ferretería Los Maestros
            </h6>
            <p className="small mb-0">Todo para tu obra, arreglo o proyecto.</p>
          </div>
          <div className="col-md-4 mb-3">
            <h6 className="fw-bold text-white">Enlaces</h6>
            <ul className="list-unstyled small mb-0">
              <li><Link to="/catalogo">Catálogo</Link></li>
              <li><Link to="/arriendo">Arriendo de herramientas</Link></li>
              <li><Link to="/reparacion">Servicio técnico</Link></li>
            </ul>
          </div>
          <div className="col-md-4 mb-3">
            <h6 className="fw-bold text-white">Contacto</h6>
            <p className="small mb-0">contacto@ferreterialosmaestros.cl</p>
            <p className="small mb-0">+56 9 1234 5678</p>
          </div>
        </div>
        <hr className="border-secondary" />
        <p className="small mb-0 text-center">
          © {new Date().getFullYear()} Ferretería Los Maestros. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}

export default Footer
