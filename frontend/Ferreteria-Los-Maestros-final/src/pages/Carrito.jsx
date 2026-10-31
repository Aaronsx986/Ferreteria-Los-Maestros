import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { clp } from '../utils.js'

function Carrito() {
  const { items, total, updateQty, removeFromCart, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-cart-x display-3 text-muted"></i>
        <h1 className="h3 my-3">Carrito de compras</h1>
        <p className="text-muted">Tu carrito está vacío.</p>
        <Link to="/catalogo" className="btn btn-primary">Ir al catálogo</Link>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <h1 className="h3 fw-bold mb-4">Carrito de compras</h1>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="table-responsive bg-white border rounded">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th style={{ width: 140 }}>Cantidad</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img src={it.imagen} alt="" className="flm-thumb" />
                        <div>
                          <div className="fw-semibold small">{it.name}</div>
                          <div className="text-muted small">{it.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td>{clp(it.price)}</td>
                    <td>
                      <div className="input-group input-group-sm">
                        <button className="btn btn-outline-secondary" onClick={() => updateQty(it.id, it.qty - 1)} aria-label="Quitar uno">
                          <i className="bi bi-dash"></i>
                        </button>
                        <span className="form-control text-center px-1">{it.qty}</span>
                        <button
                          className="btn btn-outline-secondary"
                          disabled={it.qty >= it.stock}
                          onClick={() => updateQty(it.id, it.qty + 1)}
                          aria-label="Agregar uno"
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                      </div>
                      {it.qty >= it.stock && <div className="text-warning-emphasis small mt-1">Máx. disponible</div>}
                    </td>
                    <td className="fw-semibold">{clp(it.price * it.qty)}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => removeFromCart(it.id)} aria-label="Eliminar">
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn btn-outline-secondary btn-sm mt-3" onClick={clearCart}>
            Vaciar carrito
          </button>
        </div>

        <div className="col-lg-4">
          <div className="card p-3 shadow-sm">
            <h2 className="h6 fw-bold">Resumen del pedido</h2>

            <hr />
            <div className="d-flex justify-content-between align-items-center">
              <span>Total</span>
              <span className="fs-4 fw-bold">{clp(total)}</span>
            </div>

            <Link to="/checkout" className="btn btn-primary w-100 mt-3">
              <i className="bi bi-credit-card me-1"></i> Ir a pagar
            </Link>
            <Link to="/catalogo" className="btn btn-link btn-sm w-100 mt-1">Seguir comprando</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Carrito
