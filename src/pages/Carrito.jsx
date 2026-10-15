import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

function Carrito() {
  const { items, total, updateQty, removeFromCart, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h1 className="h3 mb-3">Carrito de compras</h1>
        <p className="text-muted">Tu carrito está vacío.</p>
        <Link to="/catalogo" className="btn" style={{ background: 'var(--flm-orange)', color: '#fff' }}>
          Ir al catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <h1 className="h3 mb-4">Carrito de compras</h1>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>{it.name}</td>
                <td>${it.price.toLocaleString('es-CL')}</td>
                <td style={{ maxWidth: 100 }}>
                  <input
                    type="number"
                    min="1"
                    className="form-control form-control-sm"
                    value={it.qty}
                    onChange={(e) => updateQty(it.id, Number(e.target.value))}
                  />
                </td>
                <td>${(it.price * it.qty).toLocaleString('es-CL')}</td>
                <td>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => removeFromCart(it.id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-4">
        <button className="btn btn-outline-secondary" onClick={clearCart}>Vaciar carrito</button>
        <h4>Total: ${total.toLocaleString('es-CL')}</h4>
      </div>
      <div className="text-end mt-3">
        <button className="btn text-white" style={{ background: 'var(--flm-orange)' }}>
          Proceder al pago
        </button>
      </div>
    </div>
  )
}

export default Carrito
