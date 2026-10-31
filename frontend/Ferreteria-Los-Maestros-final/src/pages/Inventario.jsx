import { useState } from 'react'
import AdminSidebar from '../components/AdminSidebar.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import ProductFormModal from '../components/ProductFormModal.jsx'
import { useShop } from '../context/ShopContext.jsx'
import { clp, norm } from '../utils.js'

function Inventario() {
  const { products, addProduct, updateProduct, deleteProduct } = useShop()
  const [q, setQ] = useState('')
  const [onlyLow, setOnlyLow] = useState(false)
  const [form, setForm] = useState(null)       // null = cerrado, {} = nuevo, producto = edición
  const [toDelete, setToDelete] = useState(null)
  const [message, setMessage] = useState('')

  const filtered = products.filter((p) => {
    const matchesQ = q ? (norm(p.name).includes(norm(q)) || norm(p.code).includes(norm(q))) : true
    const matchesLow = onlyLow ? p.stock <= p.minStock : true
    return matchesQ && matchesLow
  })

  function handleSave(data) {
    if (form.id) {
      updateProduct(form.id, data)
      setMessage(`Producto "${data.name}" actualizado.`)
    } else {
      addProduct(data)
      setMessage(`Producto "${data.name}" creado.`)
    }
    setForm(null)
  }

  function handleDelete() {
    deleteProduct(toDelete.id)
    setMessage(`Producto "${toDelete.name}" eliminado.`)
    setToDelete(null)
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-3"><AdminSidebar /></div>
        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Inventario</h1>
            <button className="btn btn-primary btn-sm" onClick={() => setForm({})}>
              <i className="bi bi-plus-lg me-1"></i>Nuevo producto
            </button>
          </div>

          {message && (
            <div className="alert alert-success py-2 d-flex justify-content-between" role="status">
              <span>{message}</span>
              <button type="button" className="btn-close" aria-label="Cerrar aviso" onClick={() => setMessage('')}></button>
            </div>
          )}

          <div className="row g-2 mb-3">
            <div className="col-md-8">
              <input className="form-control" placeholder="Buscar por código o nombre..." value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="col-md-4 d-flex align-items-center">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="onlyLowStock" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} />
                <label className="form-check-label small" htmlFor="onlyLowStock">Solo stock bajo / agotado</label>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle">
              <thead>
                <tr>
                  <th>Código</th><th>Producto</th><th>Categoría</th><th>Marca</th><th>Precio venta</th><th>Stock</th><th>Estado</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const low = p.stock <= p.minStock
                  return (
                    <tr key={p.id}>
                      <td>{p.code}</td>
                      <td>{p.name}</td>
                      <td>{p.categoryLabel}</td>
                      <td>{p.brand}</td>
                      <td>
                        {clp(p.listPrice)}
                        {p.discount > 0 && <span className="badge bg-danger ms-1">-{p.discount}%</span>}
                      </td>
                      <td>{p.stock}</td>
                      <td>
                        {p.stock <= 0
                          ? <span className="badge bg-dark">Agotado</span>
                          : low
                          ? <span className="badge bg-danger">Stock bajo</span>
                          : <span className="badge bg-success">OK</span>}
                      </td>
                      <td className="text-nowrap">
                        <button className="btn btn-sm btn-outline-secondary me-1" aria-label={`Editar ${p.name}`} onClick={() => setForm(p)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" aria-label={`Eliminar ${p.name}`} onClick={() => setToDelete(p)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <p className="text-center text-muted py-3">No hay productos que coincidan.</p>}
        </div>
      </div>

      {form && (
        <ProductFormModal
          product={form.id ? form : null}
          products={products}
          onSave={handleSave}
          onClose={() => setForm(null)}
        />
      )}
      {toDelete && (
        <ConfirmModal
          title="Eliminar producto"
          message={`¿Seguro que quieres eliminar "${toDelete.name}"? Esta acción no se puede deshacer.`}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}

export default Inventario
