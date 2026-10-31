import AdminSidebar from '../components/AdminSidebar.jsx'
import { useShop } from '../context/ShopContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { clp } from '../utils.js'

function Dashboard() {
  const { products, suppliers, orders } = useShop()
  const { users } = useAuth()

  const stockBajo = products.filter((p) => p.stock <= p.minStock).length
  const valorInventario = products.reduce((sum, p) => sum + p.listPrice * p.stock, 0)
  const ingresos = orders.reduce((sum, o) => sum + o.total, 0)

  const kpis = [
    { label: 'Productos', value: products.length, icon: 'bi-box-seam' },
    { label: 'Stock bajo', value: stockBajo, icon: 'bi-exclamation-triangle', danger: true },
    { label: 'Usuarios', value: users.length, icon: 'bi-people' },
    { label: 'Proveedores', value: suppliers.length, icon: 'bi-truck' },
    { label: 'Ventas realizadas', value: orders.length, icon: 'bi-receipt' },
    { label: 'Ingresos', value: clp(ingresos), icon: 'bi-cash-coin' },
  ]

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-3"><AdminSidebar /></div>
        <div className="col-lg-9">
          <h1 className="h3 mb-4">Dashboard</h1>
          <div className="row g-3 mb-4">
            {kpis.map((k) => (
              <div className="col-6 col-md-4" key={k.label}>
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
            <p className="fs-3 fw-bold mb-0" style={{ color: 'var(--flm-orange)' }}>{clp(valorInventario)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
