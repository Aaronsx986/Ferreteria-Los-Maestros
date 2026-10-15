import AdminSidebar from '../components/AdminSidebar.jsx'
import productsData from '../data/products.json'

// Reporte de ejemplo agrupado por categoría
const porCategoria = Object.values(
  productsData.products.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = { categoria: p.categoryLabel, productos: 0, valor: 0 }
    acc[p.category].productos += 1
    acc[p.category].valor += p.price * p.stock
    return acc
  }, {})
)

function Reportes() {
  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-3"><AdminSidebar /></div>
        <div className="col-lg-9">
          <h1 className="h3 mb-4">Reportes</h1>

          <h6 className="fw-bold mb-3">Valor de inventario por categoría</h6>
          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle">
              <thead>
                <tr><th>ID</th><th>Tipo</th><th>Detalle</th><th>Total</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {porCategoria.map((c, i) => (
                  <tr key={c.categoria}>
                    <td>R-{String(i + 1).padStart(3, '0')}</td>
                    <td>Inventario</td>
                    <td>{c.categoria} ({c.productos} productos)</td>
                    <td>${c.valor.toLocaleString('es-CL')}</td>
                    <td><span className="badge bg-success">Actualizado</span></td>
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

export default Reportes
