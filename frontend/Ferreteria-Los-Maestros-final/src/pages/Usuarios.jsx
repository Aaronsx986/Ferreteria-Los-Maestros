import { useState } from 'react'
import AdminSidebar from '../components/AdminSidebar.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import UserFormModal from '../components/UserFormModal.jsx'
import { useAuth } from '../context/AuthContext.jsx'

function Usuarios() {
  const { users, user: me, addUser, updateUser, deleteUser } = useAuth()
  const [q, setQ] = useState('')
  const [form, setForm] = useState(null)       // null = cerrado, {} = nuevo, usuario = edición
  const [toDelete, setToDelete] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const filtered = users.filter((u) =>
    q ? u.name.toLowerCase().includes(q.toLowerCase()) || u.username.toLowerCase().includes(q.toLowerCase()) : true
  )

  function handleSave(data) {
    const result = form.username ? updateUser(form.username, data) : addUser(data)
    if (!result.ok) {
      setError(result.message)
    } else {
      setError('')
      setMessage(form.username ? `Usuario "${data.username}" actualizado.` : `Usuario "${data.username}" creado.`)
    }
    setForm(null)
  }

  function handleDelete() {
    const result = deleteUser(toDelete.username)
    if (!result.ok) {
      setError(result.message)
    } else {
      setError('')
      setMessage(`Usuario "${toDelete.username}" eliminado.`)
    }
    setToDelete(null)
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-3"><AdminSidebar /></div>
        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Usuarios</h1>
            <button className="btn btn-primary btn-sm" onClick={() => setForm({})}>
              <i className="bi bi-plus-lg me-1"></i>Nuevo usuario
            </button>
          </div>

          {message && <div className="alert alert-success py-2" role="status">{message}</div>}
          {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}

          <input className="form-control mb-3" placeholder="Buscar usuario..." value={q} onChange={(e) => setQ(e.target.value)} />

          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle">
              <thead>
                <tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.username}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td className="text-capitalize">{u.role}</td>
                    <td>
                      <span className={`badge ${u.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                        {u.status === 'active' ? 'Activo' : u.status}
                      </span>
                    </td>
                    <td className="text-nowrap">
                      <button className="btn btn-sm btn-outline-secondary me-1" aria-label={`Editar ${u.username}`} onClick={() => setForm(u)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        aria-label={`Eliminar ${u.username}`}
                        disabled={me?.username === u.username}
                        onClick={() => setToDelete(u)}
                      >
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
        <UserFormModal
          user={form.username ? form : null}
          users={users}
          isSelf={Boolean(form.username) && me?.username === form.username}
          onSave={handleSave}
          onClose={() => setForm(null)}
        />
      )}
      {toDelete && (
        <ConfirmModal
          title="Eliminar usuario"
          message={`¿Seguro que quieres eliminar a "${toDelete.name}"?`}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}

export default Usuarios
