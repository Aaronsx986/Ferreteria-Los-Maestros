import { clp } from '../utils.js'

// Datos del cliente, dirección y detalle de productos.
// Lo comparten las pantallas de compra exitosa y de pago fallido (mismo diseño, distinto encabezado).
function Dato({ label, value, className = 'col-md-4' }) {
  return (
    <div className={`${className} mb-2`}>
      <div className="small text-muted">{label}</div>
      <div className="form-control-plaintext py-0 fw-semibold">{value || '—'}</div>
    </div>
  )
}

function ResumenCompra({ shipping, delivery, items, total }) {
  const despacho = delivery === 'despacho'
  return (
    <>
      <h2 className="h6 fw-bold mt-3">Información del cliente</h2>
      <div className="row">
        <Dato label="Nombre" value={shipping?.nombre} />
        <Dato label="Apellido" value={shipping?.apellido} />
        <Dato label="Correo" value={shipping?.correo} />
      </div>

      <h2 className="h6 fw-bold mt-3">{despacho ? 'Dirección de entrega' : 'Retiro en tienda'}</h2>
      {despacho ? (
        <div className="row">
          <Dato label="Calle" value={shipping?.calle} />
          <Dato label="Departamento" value={shipping?.departamento} />
          <Dato label="Región" value={shipping?.region} />
          <Dato label="Comuna" value={shipping?.comuna} />
          <Dato label="Indicaciones" value={shipping?.indicaciones} className="col-12" />
        </div>
      ) : (
        <p className="mb-2">Retiro en tienda Santiago Centro.</p>
      )}

      <div className="table-responsive mt-3">
        <table className="table table-sm align-middle mb-0">
          <thead>
            <tr><th>Imagen</th><th>Nombre</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th></tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td><img src={it.imagen} alt="" className="flm-thumb" /></td>
                <td>{it.name}</td>
                <td>{clp(it.price)}</td>
                <td>{it.qty}</td>
                <td>{clp(it.price * it.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center border rounded py-2 mt-3 fs-5 fw-bold">
        Total pagado: {clp(total)}
      </div>
    </>
  )
}

export default ResumenCompra
