import { useEffect, useRef, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import { useCart } from '../context/CartContext.jsx'
import { clp } from '../utils.js'

function ProductCard({ product }) {
  const { addToCart, qtyInCart } = useCart()
  const [imgError, setImgError] = useState(false)
  const [added, setAdded] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const stock = product.stock ?? 0
  const sinStock = stock <= 0
  const enCarrito = qtyInCart(product.id)
  const maximo = !sinStock && enCarrito >= stock

  function handleAdd() {
    if (addToCart(product.id)) {
      setAdded(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setAdded(false), 1200)
    }
  }

  const renderStockBadge = () => {
    if (sinStock) {
      return <span className="text-danger fw-bold small text-uppercase mb-2">No disponible</span>
    }
    if (stock <= 3) {
      return (
        <span className="text-warning-emphasis fw-bolder small text-uppercase mb-2">
          ¡Últimas unidades! ({stock})
        </span>
      )
    }
    return <span className="text-success fw-semibold small text-uppercase mb-2">Disponible</span>
  }

  let label = 'Agregar al carrito'
  if (sinStock) label = 'Sin stock'
  else if (added) label = '¡Agregado!'
  else if (maximo) label = 'Máximo en carrito'

  return (
    <Card className="flm-product-card h-100 shadow-sm">
      {imgError || !product.imagen ? (
        <div className="flm-product-img flm-product-img-fallback">
          <i className={`bi ${product.icon || 'bi-box-seam'}`}></i>
        </div>
      ) : (
        <Card.Img
          variant="top"
          className="flm-product-img"
          src={product.imagen}
          alt={product.name}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      )}
      <Card.Body className="d-flex flex-column">
        <span className="text-muted text-uppercase small mb-1">{product.brand}</span>
        <Card.Title className="text-dark fw-bold fs-6 mb-2">{product.name}</Card.Title>
        <Card.Text className="text-dark fw-semibold fs-5 mb-1">
          {clp(product.price)}
          <small className="text-muted fw-normal fs-6"> / {product.unit?.toLowerCase()}</small>
        </Card.Text>
        {renderStockBadge()}
        <Button
          variant={sinStock || maximo ? 'secondary' : added ? 'success' : 'primary'}
          disabled={sinStock || maximo}
          className="mt-auto"
          onClick={handleAdd}
        >
          {!sinStock && !maximo && <i className={`bi ${added ? 'bi-check2' : 'bi-cart-plus'} me-1`}></i>}
          {label}
        </Button>
      </Card.Body>
    </Card>
  )
}

export default ProductCard
