import { useState } from 'react'
import AdminSidebar from '../components/AdminSidebar.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import SupplierFormModal from '../components/SupplierFormModal.jsx'
import { useShop } from '../context/ShopContext.jsx'

function Proveedores() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useShop()
  const [q, setQ] = useState('')
  const [form, setForm] = useState(null)       // null = cerrado, {} = nuevo, proveedor = edición
  const [toDelete, setToDelete] = useState(null)
  const [message, setMessage] = useState('')

  const filtered = suppliers.filter((s) =>
    q ? s.name.toLowerCase().includes(q.toLowerCase()) : true
  )

  function handleSave(data) {
    if (form.id) {
      updateSupplier(form.id, data)
      setMessage(`Proveedor "${data.name}" actualizado.`)
    } else {
      addSupplier(data)
      setMessage(`Proveedor "${data.name}" creado.`)
    }
    setForm(null)
  }

  function handleDelete() {
    deleteSupplier(toDelete.id)
    setMessage(`Proveedor "${toDelete.name}" eliminado.`)
    setToDelete(null)
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-3"><AdminSidebar /></div>
        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Proveedores</h1>
            <button className="btn btn-primary btn-sm" onClick={() => setForm({})}>
              <i className="bi bi-plus-lg me-1"></i>Nuevo proveedor
            </button>
          </div>

          {message && <div className="alert alert-success py-2" role="status">{message}</div>}

          <input className="form-control mb-3" placeholder="Buscar proveedor..." value={q} onChange={(e) => setQ(e.target.value)} />

          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle">
              <thead>
                <tr><th>Proveedor</th><th>Contacto</th><th>Pago</th><th>Entrega</th><th>Rating</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>
                      <div>{s.contact.name}</div>
                      <div className="small text-muted">{s.contact.email}</div>
                    </td>
                    <td>{s.paymentTerms}</td>
                    <td>{s.deliveryTime}</td>
                    <td><i className="bi bi-star-fill text-warning"></i> {s.rating}</td>
                    <td>
                      <span className={`badge ${s.status === 'active' ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {s.status === 'active' ? 'Activo' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="text-nowrap">
                      <button className="btn btn-sm btn-outline-secondary me-1" aria-label={`Editar ${s.name}`} onClick={() => setForm(s)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" aria-label={`Eliminar ${s.name}`} onClick={() => setToDelete(s)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {form && (
        <SupplierFormModal
          supplier={form.id ? form : null}
          suppliers={suppliers}
          onSave={handleSave}
          onClose={() => setForm(null)}
        />
      )}
      {toDelete && (
        <ConfirmModal
          title="Eliminar proveedor"
          message={`¿Seguro que quieres eliminar a "${toDelete.name}"?`}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}

export default Proveedores
