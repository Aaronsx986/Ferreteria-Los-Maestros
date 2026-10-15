import { useState } from 'react'
import AdminSidebar from '../components/AdminSidebar.jsx'
import { useShop } from '../context/ShopContext.jsx'
import { norm } from '../utils.js'

function Inventario() {
  const { products } = useShop()
  const [q, setQ] = useState('')
  const [onlyLow, setOnlyLow] = useState(false)

  const filtered = products.filter((p) => {
    const matchesQ = q ? (norm(p.name).includes(norm(q)) || norm(p.code).includes(norm(q))) : true
    const matchesLow = onlyLow ? p.stock <= p.minStock : true
    return matchesQ && matchesLow
  })

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-3"><AdminSidebar /></div>
        <div className="col-lg-9">
          <h1 className="h3 mb-4">Inventario</h1>

          <div className="row g-2 mb-3">
            <div className="col-md-8">
              <input className="form-control" placeholder="Buscar por código o nombre..." value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="col-md-4 d-flex align-items-center">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="onlyLowStock" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} />
                <label className="form-check-label small" htmlFor="onlyLowStock">Solo stock bajo / agotado</label>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle">
              <thead>
                <tr>
                  <th>Código</th><th>Producto</th><th>Categoría</th><th>Marca</th><th>Precio venta</th><th>Stock</th><th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const low = p.stock <= p.minStock
                  return (
                    <tr key={p.id}>
                      <td>{p.code}</td>
                      <td>{p.name}</td>
                      <td>{p.categoryLabel}</td>
                      <td>{p.brand}</td>
                      <td>${p.price.toLocaleString('es-CL')}</td>
                      <td>{p.stock}</td>
                      <td>
                        {p.stock <= 0
                          ? <span className="badge bg-dark">Agotado</span>
                          : low
                          ? <span className="badge bg-danger">Stock bajo</span>
                          : <span className="badge bg-success">OK</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Inventario
