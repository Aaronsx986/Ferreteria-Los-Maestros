import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ResumenCompra from '../components/ResumenCompra.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useShop } from '../context/ShopContext.jsx'

function CompraExitosa() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const { orders } = useShop()
  const [enviada, setEnviada] = useState(false)

  const order = orders.find((o) => o.id === id)

  // Solo el dueño de la compra (o un administrador) puede ver el comprobante
  if (!order || (order.username !== user?.username && !isAdmin)) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-receipt display-3 text-muted"></i>
        <h1 className="h4 my-3">No encontramos esa compra</h1>
        <Link to="/historial" className="btn btn-primary">Ir a mi historial</Link>
      </div>
    )
  }

  // Las compras antiguas no tienen "shipping": se arma con los datos del cliente
  const shipping = order.shipping || { nombre: order.customer, correo: user?.email }

  return (
    <div className="container py-4" style={{ maxWidth: 860 }}>
      <div className="card p-4 shadow-sm">
        <div className="d-flex justify-content-between flex-wrap gap-2">
          <h1 className="h4 fw-bold text-success mb-0">
            <i className="bi bi-check-circle me-2"></i>
            Se ha realizado la compra nro #{order.id}
          </h1>
          <span className="small text-muted">Estado: {order.estado}</span>
        </div>

        <ResumenCompra shipping={shipping} delivery={order.delivery} items={order.items} total={order.total} />

        {enviada && (
          <div className="alert alert-success py-2 mt-3 mb-0" role="status">
            Enviamos la boleta a {shipping.correo || 'tu correo'}.
          </div>
        )}

        <div className="d-flex flex-wrap justify-content-center gap-2 mt-3 d-print-none">
          <button type="button" className="btn btn-danger btn-sm" onClick={() => window.print()}>
            <i className="bi bi-file-earmark-pdf me-1"></i>Imprimir boleta en PDF
          </button>
          <button type="button" className="btn btn-success btn-sm" onClick={() => setEnviada(true)}>
            <i className="bi bi-envelope me-1"></i>Enviar boleta por email
          </button>
          <Link to="/historial" className="btn btn-outline-secondary btn-sm">Ver mi historial</Link>
          <Link to="/catalogo" className="btn btn-outline-primary btn-sm">Seguir comprando</Link>
        </div>
      </div>
    </div>
  )
}

export default CompraExitosa
