import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useShop } from '../context/ShopContext.jsx'
import { clp } from '../utils.js'

function DetalleProducto() {
  const { id } = useParams()
  const { products } = useShop()
  const { addToCart, qtyInCart } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const product = products.find((p) => String(p.id) === id)

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-box-seam display-3 text-muted"></i>
        <h1 className="h4 my-3">Producto no encontrado</h1>
        <Link to="/catalogo" className="btn btn-primary">Volver al catálogo</Link>
      </div>
    )
  }

  const disponible = product.stock - qtyInCart(product.id)
  const sinStock = product.stock <= 0
  const enOferta = product.discount > 0
  const relacionados = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  function handleAdd() {
    if (addToCart(product.id, qty)) {
      setAdded(true)
      setQty(1)
    }
  }

  return (
    <main className="container py-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
          <li className="breadcrumb-item"><Link to="/catalogo">Catálogo</Link></li>
          <li className="breadcrumb-item"><Link to={`/catalogo?cat=${product.category}`}>{product.categoryLabel}</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className="row g-4">
        <div className="col-md-5">
          {imgError || !product.imagen ? (
            <div className="flm-detail-img flm-detail-img-fallback">
              <i className={`bi ${product.icon || 'bi-box-seam'}`}></i>
            </div>
          ) : (
            <img className="flm-detail-img" src={product.imagen} alt={product.name} onError={() => setImgError(true)} />
          )}
        </div>

        <div className="col-md-7">
          <span className="text-muted text-uppercase small">{product.brand}</span>
          <h1 className="h3 fw-bold">{product.name}</h1>
          <p className="text-muted small mb-2">Código: {product.code}</p>

          {enOferta && (
            <div>
              <s className="text-muted">{clp(product.listPrice)}</s>
              <span className="badge bg-danger ms-2">-{product.discount}%</span>
            </div>
          )}
          <p className="fs-2 fw-bold mb-1">
            {clp(product.price)}
            <small className="text-muted fw-normal fs-6"> / {product.unit?.toLowerCase()}</small>
          </p>

          {sinStock ? (
            <p className="text-danger fw-bold">No disponible</p>
          ) : (
            <p className="text-success fw-semibold">Disponible · {product.stock} en stock</p>
          )}

          <div className="d-flex align-items-end gap-2 mb-2">
            <div style={{ width: 110 }}>
              <label htmlFor="detalle-qty" className="form-label small fw-semibold">Cantidad</label>
              <input
                id="detalle-qty"
                type="number"
                className="form-control"
                min="1"
                max={Math.max(disponible, 1)}
                value={qty}
                disabled={sinStock || disponible <= 0}
                onChange={(e) => setQty(Math.min(Math.max(1, Math.floor(Number(e.target.value)) || 1), Math.max(disponible, 1)))}
              />
            </div>
            <button className="btn btn-primary" disabled={sinStock || disponible <= 0} onClick={handleAdd}>
              <i className="bi bi-cart-plus me-1"></i>Agregar al carrito
            </button>
          </div>

          {!sinStock && disponible <= 0 && (
            <p className="text-warning-emphasis small">Ya tienes todo el stock disponible en tu carrito.</p>
          )}
          {added && (
            <div className="alert alert-success py-2 small" role="status">
              Producto agregado. <Link to="/carrito">Ver carrito</Link>
            </div>
          )}

          <table className="table table-sm mt-3">
            <tbody>
              <tr><th scope="row">Marca</th><td>{product.brand}</td></tr>
              <tr><th scope="row">Categoría</th><td>{product.categoryLabel}</td></tr>
              <tr><th scope="row">Subcategoría</th><td>{product.subcategory}</td></tr>
              <tr><th scope="row">Unidad de venta</th><td>{product.unit}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className="mt-4">
          <h2 className="h5 fw-bold">Productos relacionados</h2>
          <div className="flm-grid">
            {relacionados.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </main>
  )
}

export default DetalleProducto
