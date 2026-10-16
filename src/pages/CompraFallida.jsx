import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import ResumenCompra from '../components/ResumenCompra.jsx'

// Se llega solo desde el checkout, que envía los datos de la compra fallida en location.state
function CompraFallida() {
  const { state } = useLocation()
  const navigate = useNavigate()

  if (!state?.items) return <Navigate to="/carrito" replace />

  const { motivo, form, items, total, ref } = state

  return (
    <div className="container py-4" style={{ maxWidth: 860 }}>
      <div className="card p-4 shadow-sm">
        <h1 className="h4 fw-bold text-danger mb-1">
          <i className="bi bi-x-circle me-2"></i>
          No se pudo realizar el pago. nro #{ref}
        </h1>
        <p className="text-muted mb-3">{motivo}</p>

        <div className="text-center mb-2">
          <button type="button" className="btn btn-success" onClick={() => navigate('/checkout', { state: { form } })}>
            VOLVER A REALIZAR EL PAGO
          </button>
        </div>

        <ResumenCompra shipping={form} delivery={form.delivery} items={items} total={total} />

        <div className="text-center mt-3">
          <Link to="/carrito" className="btn btn-outline-secondary btn-sm">Volver al carrito</Link>
        </div>
      </div>
    </div>
  )
}

export default CompraFallida
