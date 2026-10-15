import { useState } from 'react'
import AdminSidebar from '../components/AdminSidebar.jsx'

// Datos de ejemplo (en el proyecto original vendrían de un backend)
const ventasDemo = [
  { id: 'V-5001', cliente: 'Cliente Ejemplo', productos: 'Cemento Polpaico x4', total: 23960, fecha: '2026-09-02', estado: 'Pagado' },
  { id: 'V-5002', cliente: 'Juan Pérez', productos: 'Taladro Makita, Brocas', total: 89990, fecha: '2026-09-15', estado: 'Pagado' },
  { id: 'V-5003', cliente: 'María Soto', productos: 'Pintura látex x3', total: 29970, fecha: '2026-09-28', estado: 'Pendiente' },
]

function Ventas() {
  const [q, setQ] = useState('')

  const filtered = ventasDemo.filter((v) =>
    q ? (v.cliente.toLowerCase().includes(q.toLowerCase()) || v.productos.toLowerCase().includes(q.toLowerCase())) : true
  )

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-3"><AdminSidebar /></div>
        <div className="col-lg-9">
          <h1 className="h3 mb-4">Ventas</h1>

          <input className="form-control mb-3" placeholder="Buscar cliente o producto..." value={q} onChange={(e) => setQ(e.target.value)} />

          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle">
              <thead>
                <tr><th>ID Venta</th><th>Cliente</th><th>Producto(s)</th><th>Total</th><th>Fecha</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id}>
                    <td>{v.id}</td>
                    <td>{v.cliente}</td>
                    <td>{v.productos}</td>
                    <td>${v.total.toLocaleString('es-CL')}</td>
                    <td>{v.fecha}</td>
                    <td>
                      <span className={`badge ${v.estado === 'Pagado' ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {v.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Ventas
