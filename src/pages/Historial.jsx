import { useAuth } from '../context/AuthContext.jsx'

// Datos de ejemplo (en el proyecto original vendrían de un backend/JSON de pedidos)
const compras = [
  { id: 'C-1001', fecha: '2026-09-02', productos: 'Cemento Polpaico x4, Taladro Makita', total: 103950, estado: 'Entregado' },
  { id: 'C-1002', fecha: '2026-09-20', productos: 'Pintura látex x2, Rodillo', total: 23970, estado: 'Entregado' },
]

const arriendos = [
  { id: 'A-201', herramienta: 'Amoladora angular 4.5"', inicio: '2026-09-10', termino: '2026-09-12', costo: 15000, estado: 'Finalizado' },
]

const servicios = [
  { id: 'S-301', servicio: 'Reparación taladro Makita', solicitado: '2026-09-05', completado: '2026-09-07', estado: 'Finalizado' },
]

function Historial() {
  const { user } = useAuth()

  return (
    <div className="container py-4">
      <h1 className="h3 mb-1">Mi historial</h1>
      <p className="text-muted mb-4">Hola {user?.name || user?.username}, aquí está tu actividad reciente.</p>

      <h6 className="fw-bold">Compras</h6>
      <div className="table-responsive mb-4">
        <table className="table table-sm align-middle">
          <thead><tr><th>ID Compra</th><th>Fecha</th><th>Producto(s)</th><th>Total</th><th>Estado</th></tr></thead>
          <tbody>
            {compras.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td><td>{c.fecha}</td><td>{c.productos}</td>
                <td>${c.total.toLocaleString('es-CL')}</td>
                <td><span className="badge bg-success">{c.estado}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h6 className="fw-bold">Arriendos</h6>
      <div className="table-responsive mb-4">
        <table className="table table-sm align-middle">
          <thead><tr><th>ID Arriendo</th><th>Herramienta</th><th>Inicio</th><th>Término</th><th>Costo</th><th>Estado</th></tr></thead>
          <tbody>
            {arriendos.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td><td>{a.herramienta}</td><td>{a.inicio}</td><td>{a.termino}</td>
                <td>${a.costo.toLocaleString('es-CL')}</td>
                <td><span className="badge bg-secondary">{a.estado}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h6 className="fw-bold">Servicio técnico</h6>
      <div className="table-responsive">
        <table className="table table-sm align-middle">
          <thead><tr><th>ID Servicio</th><th>Servicio</th><th>Solicitado</th><th>Completado</th><th>Estado</th></tr></thead>
          <tbody>
            {servicios.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td><td>{s.servicio}</td><td>{s.solicitado}</td><td>{s.completado}</td>
                <td><span className="badge bg-success">{s.estado}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Historial
