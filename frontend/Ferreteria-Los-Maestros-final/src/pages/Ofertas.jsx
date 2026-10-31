import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { useShop } from '../context/ShopContext.jsx'

function Ofertas() {
  const { products } = useShop()

  // Mayor descuento primero
  const ofertas = products
    .filter((p) => p.discount > 0)
    .sort((a, b) => b.discount - a.discount)

  return (
    <main className="container py-4">
      <h1 className="h3 fw-bold mb-1">
        <i className="bi bi-tag-fill me-2" style={{ color: 'var(--flm-orange)' }}></i>Ofertas
      </h1>
      <p className="text-muted mb-0">
        {ofertas.length} {ofertas.length === 1 ? 'producto con descuento' : 'productos con descuento'}
      </p>

      {ofertas.length > 0 ? (
        <div className="flm-grid">
          {ofertas.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="text-center text-muted py-5">
          <i className="bi bi-tag fs-1 d-block mb-2"></i>
          <p className="mb-2">Por ahora no hay productos en oferta.</p>
          <Link to="/catalogo" className="btn btn-outline-secondary btn-sm">Ver catálogo</Link>
        </div>
      )}
    </main>
  )
}

export default Ofertas
