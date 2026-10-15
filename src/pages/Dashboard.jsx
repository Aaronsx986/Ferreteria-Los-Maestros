import AdminSidebar from '../components/AdminSidebar.jsx'
import productsData from '../data/products.json'
import usersData from '../data/users.json'
import suppliersData from '../data/suppliers.json'

function Dashboard() {
  const totalProductos = productsData.products.length
  const stockBajo = productsData.products.filter((p) => p.stock <= p.minStock).length
  const valorInventario = productsData.products.reduce((sum, p) => sum + p.price * p.stock, 0)

  const kpis = [
    { label: 'Productos', value: totalProductos, icon: 'bi-box-seam' },
    { label: 'Stock bajo', value: stockBajo, icon: 'bi-exclamation-triangle', danger: true },
    { label: 'Usuarios', value: usersData.users.length, icon: 'bi-people' },
    { label: 'Proveedores', value: suppliersData.suppliers.length, icon: 'bi-truck' },
  ]

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-3"><AdminSidebar /></div>
        <div className="col-lg-9">
          <h1 className="h3 mb-4">Dashboard</h1>
          <div className="row g-3 mb-4">
            {kpis.map((k) => (
              <div className="col-6 col-md-3" key={k.label}>
                <div className="card text-center py-3">
                  <i className={`bi ${k.icon} fs-3 ${k.danger ? 'text-danger' : ''}`} style={!k.danger ? { color: 'var(--flm-orange)' } : {}}></i>
                  <div className="fs-4 fw-bold mt-1">{k.value}</div>
                  <div className="small text-muted">{k.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card p-3">
            <h6 className="fw-bold">Valor total del inventario</h6>
            <p className="fs-3 fw-bold mb-0" style={{ color: 'var(--flm-orange)' }}>
              ${valorInventario.toLocaleString('es-CL')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
