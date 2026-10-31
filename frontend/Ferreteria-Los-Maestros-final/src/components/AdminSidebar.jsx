import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { to: '/inventario', label: 'Inventario', icon: 'bi-box-seam' },
  { to: '/ventas', label: 'Ventas', icon: 'bi-receipt' },
  { to: '/usuarios', label: 'Usuarios', icon: 'bi-people' },
  { to: '/proveedores', label: 'Proveedores', icon: 'bi-truck' },
  { to: '/reportes', label: 'Reportes', icon: 'bi-bar-chart' },
]

function AdminSidebar() {
  return (
    <div className="bg-white border rounded p-2 mb-4 mb-lg-0">
      <nav className="nav nav-pills flex-lg-column">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              'nav-link d-flex align-items-center gap-2 mb-1 ' + (isActive ? 'active' : 'text-dark')
            }
          >
            <i className={`bi ${l.icon}`}></i> {l.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default AdminSidebar
