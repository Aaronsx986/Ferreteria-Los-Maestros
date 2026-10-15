function Footer() {
  return (
    <footer className="text-light pt-4 pb-3 mt-5" style={{ background: 'var(--flm-dark)' }}>
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3">
            <h6 className="fw-bold"><i className="bi bi-bricks me-1"></i> Ferretería Los Maestros</h6>
            <p className="small text-secondary">Todo para tu obra, arreglo o proyecto.</p>
          </div>
          <div className="col-md-4 mb-3">
            <h6 className="fw-bold">Enlaces</h6>
            <ul className="list-unstyled small">
              <li><a href="/catalogo" className="link-light text-decoration-none">Catálogo</a></li>
              <li><a href="/arriendo" className="link-light text-decoration-none">Arriendo de herramientas</a></li>
              <li><a href="/reparacion" className="link-light text-decoration-none">Servicio técnico</a></li>
            </ul>
          </div>
          <div className="col-md-4 mb-3">
            <h6 className="fw-bold">Contacto</h6>
            <p className="small text-secondary mb-0">contacto@ferreterialosmaestros.cl</p>
            <p className="small text-secondary">+56 9 1234 5678</p>
          </div>
        </div>
        <hr className="border-secondary" />
        <p className="small text-secondary mb-0 text-center">
          © {new Date().getFullYear()} Ferretería Los Maestros. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}

export default Footer
