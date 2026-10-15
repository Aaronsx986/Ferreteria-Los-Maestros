import { useState } from 'react'
import AdminSidebar from '../components/AdminSidebar.jsx'
import usersData from '../data/users.json'

function Usuarios() {
  const [q, setQ] = useState('')

  const filtered = usersData.users.filter((u) =>
    q ? u.name.toLowerCase().includes(q.toLowerCase()) || u.username.toLowerCase().includes(q.toLowerCase()) : true
  )

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-3"><AdminSidebar /></div>
        <div className="col-lg-9">
          <h1 className="h3 mb-4">Usuarios</h1>

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
                    <td><button className="btn btn-sm btn-outline-secondary"><i className="bi bi-pencil"></i></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Usuarios
