import AdminSidebar from '../components/AdminSidebar.jsx'
import { useShop } from '../context/ShopContext.jsx'
import { clp } from '../utils.js'

function Reportes() {
  const { products, orders } = useShop()

  const porCategoria = Object.values(
    products.reduce((acc, p) => {
      if (!acc[p.category]) acc[p.category] = { categoria: p.categoryLabel, productos: 0, valor: 0 }
      acc[p.category].productos += 1
      acc[p.category].valor += p.listPrice * p.stock
      return acc
    }, {})
  )

  const porProducto = Object.values(
    orders.flatMap((o) => o.items).reduce((acc, i) => {
      if (!acc[i.id]) acc[i.id] = { name: i.name, qty: 0, total: 0 }
      acc[i.id].qty += i.qty
      acc[i.id].total += i.qty * i.price
      return acc
    }, {})
  ).sort((a, b) => b.total - a.total)

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-3"><AdminSidebar /></div>
        <div className="col-lg-9">
          <h1 className="h3 mb-4">Reportes</h1>

          <h6 className="fw-bold mb-3">Valor de inventario por categoría</h6>
          <div className="table-responsive mb-4">
            <table className="table table-sm table-hover align-middle">
              <thead><tr><th>Categoría</th><th>Productos</th><th>Valor en stock</th></tr></thead>
              <tbody>
                {porCategoria.map((c) => (
                  <tr key={c.categoria}><td>{c.categoria}</td><td>{c.productos}</td><td>{clp(c.valor)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <h6 className="fw-bold mb-3">Ventas por producto</h6>
          {porProducto.length === 0 ? (
            <p className="text-muted">Todavía no hay ventas registradas.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle">
                <thead><tr><th>Producto</th><th>Unidades</th><th>Ingresos</th></tr></thead>
                <tbody>
                  {porProducto.map((p) => (
                    <tr key={p.name}><td>{p.name}</td><td>{p.qty}</td><td>{clp(p.total)}</td></tr>
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

export default Reportes
