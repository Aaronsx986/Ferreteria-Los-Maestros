import { Link } from 'react-router-dom';

function Catbar() {
  return (
    <div className="flm-catnav">
      <div className="container flm-catnav-scroll">
        <ul className="nav flex-nowrap">
          <li className="nav-item">
            <Link className="nav-link" to="/catalogo?cat=construccion">Materiales de Construcción</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/catalogo?cat=pinturas">Pinturas y Recubrimientos</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/catalogo?cat=herramientas">Herramientas</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/catalogo?cat=gasfiteria">Gasfitería</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/catalogo?cat=electricidad">Electricidad</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/catalogo?cat=tornilleria">Tornillería y Fijaciones</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/catalogo?cat=madera">Madera y Tableros</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/catalogo?cat=seguridad">Seguridad y EPP</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/catalogo?cat=jardin">Jardín y Exterior</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Catbar;