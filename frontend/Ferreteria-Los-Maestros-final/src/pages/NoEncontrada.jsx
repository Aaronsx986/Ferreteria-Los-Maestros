import { Link } from 'react-router-dom'

// Se muestra para cualquier ruta que no exista (404)
function NoEncontrada() {
  return (
    <div className="container py-5 text-center">
      <i className="bi bi-compass display-1 text-muted"></i>
      <h1 className="display-5 fw-bold mt-3">404</h1>
      <p className="lead">La página que buscas no existe o fue movida.</p>
      <div className="d-flex justify-content-center gap-2">
        <Link to="/" className="btn btn-primary">Ir al inicio</Link>
        <Link to="/catalogo" className="btn btn-outline-secondary">Ver catálogo</Link>
      </div>
    </div>
  )
}

export default NoEncontrada
