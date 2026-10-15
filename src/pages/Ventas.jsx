import { useState } from 'react'
import AdminSidebar from '../components/AdminSidebar.jsx'
import { useShop } from '../context/ShopContext.jsx'
import { norm, clp, formatDate } from '../utils.js'

function Ventas() {
  const { orders } = useShop()
  const [q, setQ] = useState('')

  const filtered = orders.filter((o) => {
    if (!q) return true
    const hay = norm([o.id, o.customer, o.username, ...o.items.map((i) => i.name)].join(' '))
    return norm(q).split(/\s+/).every((t) => hay.includes(t))
  })

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-3"><AdminSidebar /></div>
        <div className="col-lg-9">
          <h1 className="h3 mb-4">Ventas</h1>

          <input className="form-control mb-3" placeholder="Buscar cliente, ID o producto..." value={q} onChange={(e) => setQ(e.target.value)} />

          {filtered.length === 0 ? (
            <div className="text-center text-muted py-5 bg-white border rounded">
              {orders.length === 0
                ? 'Aún no hay ventas. Las compras de los clientes aparecerán aquí.'
                : 'Ninguna venta coincide con la búsqueda.'}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle">
                <thead>
                  <tr><th>ID Venta</th><th>Cliente</th><th>Producto(s)</th><th>Total</th><th>Fecha</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  {filtered.map((v) => (
                    <tr key={v.id}>
                      <td>{v.id}</td>
                      <td>{v.customer}</td>
                      <td className="small">{v.items.map((i) => `${i.name} x${i.qty}`).join(', ')}</td>
                      <td>{clp(v.total)}</td>
                      <td className="text-nowrap">{formatDate(v.fecha)}</td>
                      <td><span className="badge bg-success">{v.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Ventas
