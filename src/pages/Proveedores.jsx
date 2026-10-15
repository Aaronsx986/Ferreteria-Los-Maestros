import { useState } from 'react'
import AdminSidebar from '../components/AdminSidebar.jsx'
import suppliersData from '../data/suppliers.json'

function Proveedores() {
  const [q, setQ] = useState('')

  const filtered = suppliersData.suppliers.filter((s) =>
    q ? s.name.toLowerCase().includes(q.toLowerCase()) : true
  )

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-3"><AdminSidebar /></div>
        <div className="col-lg-9">
          <h1 className="h3 mb-4">Proveedores</h1>

          <input className="form-control mb-3" placeholder="Buscar proveedor..." value={q} onChange={(e) => setQ(e.target.value)} />

          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle">
              <thead>
                <tr><th>Proveedor</th><th>Contacto</th><th>Pago</th><th>Entrega</th><th>Rating</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>
                      <div>{s.contact.name}</div>
                      <div className="small text-muted">{s.contact.email}</div>
                    </td>
                    <td>{s.paymentTerms}</td>
                    <td>{s.deliveryTime}</td>
                    <td><i className="bi bi-star-fill text-warning"></i> {s.rating}</td>
                    <td>
                      <span className={`badge ${s.status === 'active' ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {s.status === 'active' ? 'Activo' : 'Pendiente'}
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

export default Proveedores
