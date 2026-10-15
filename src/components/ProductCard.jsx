import { useCart } from '../context/CartContext.jsx'

function ProductCard({ product }) {
  const { addToCart } = useCart()
  const lowStock = product.stock <= product.minStock

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body d-flex flex-column">
        <div className="mb-2">
          <i className={`bi ${product.icon} fs-1`} style={{ color: 'var(--flm-orange)' }}></i>
        </div>
        <span className="badge bg-secondary-subtle text-secondary mb-2 align-self-start">
          {product.categoryLabel}
        </span>
        <h6 className="card-title">{product.name}</h6>
        <p className="small text-muted mb-1">{product.brand} · {product.unit}</p>
        {lowStock ? (
          <span className="badge bg-danger-subtle text-danger mb-2 align-self-start">Stock bajo</span>
        ) : (
          <span className="badge bg-success-subtle text-success mb-2 align-self-start">Disponible</span>
        )}
        <p className="fw-bold fs-5 mt-auto mb-2">${product.price.toLocaleString('es-CL')}</p>
        <button className="btn btn-sm text-white" style={{ background: 'var(--flm-orange)' }} onClick={() => addToCart(product.id)}>
          <i className="bi bi-cart-plus me-1"></i> Agregar
        </button>
      </div>
    </div>
  )
}

export default ProductCard
