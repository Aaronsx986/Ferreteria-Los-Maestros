import { Link } from 'react-router-dom';

function Topbar() {
  return (
    <div className="flm-topbar py-1 d-none d-md-block">
      <div className="container d-flex justify-content-between align-items-center">
        <div>
          <i className="bi bi-geo-alt"></i> Retiro en tienda Santiago Centro &nbsp;|&nbsp; 
          <i className="bi bi-truck"></i> Despacho a todo Chile
        </div>
        <div>
          <Link to="/reparacion" className="me-3 text-decoration-none">
            <i className="bi bi-tools"></i> Servicio Técnico
          </Link>
          <Link to="/arriendo" className="me-3 text-decoration-none">
            <i className="bi bi-calendar2-check"></i> Arriendo de Herramientas
          </Link>
          {/* El enlace de teléfono se queda con <a> normal porque no es una ruta de React */}
          <a href="tel:+56223456789" className="text-decoration-none">
            <i className="bi bi-telephone"></i> 600 123 4567
          </a>
        </div>
      </div>
    </div>
  );
}

export default Topbar;