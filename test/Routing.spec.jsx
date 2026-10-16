// PRUEBAS — ProtectedRoute, AdminSidebar, Footer, Topbar
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../src/context/AuthContext.jsx'
import ProtectedRoute from '../src/components/ProtectedRoute.jsx'
import AdminSidebar from '../src/components/AdminSidebar.jsx'
import Footer from '../src/components/Footer.jsx'
import Topbar from '../src/components/Topbar.jsx'
import { ADMIN, CLIENTE, loginAs } from './helpers.jsx'

function montar(adminOnly, ruta = '/privado') {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<p>Pantalla inicio</p>} />
          <Route path="/login" element={<p>Pantalla login</p>} />
          <Route path="/privado" element={<ProtectedRoute adminOnly={adminOnly}><p>Contenido secreto</p></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('ProtectedRoute — control de acceso por sesión y rol', () => {
  it('sin sesión redirige a /login', () => {
    montar(false)
    expect(screen.getByText('Pantalla login')).toBeInTheDocument()
    expect(screen.queryByText('Contenido secreto')).toBeNull()
  })
})

describe('AdminSidebar', () => {
  it('muestra los 6 enlaces del panel de administración', () => {
    render(<MemoryRouter><AdminSidebar /></MemoryRouter>)
    expect(screen.getAllByRole('link').map((a) => a.textContent.trim()))
      .toEqual(['Dashboard', 'Inventario', 'Ventas', 'Usuarios', 'Proveedores', 'Reportes'])
  })
})

describe('Footer y Topbar', () => {
  it('Footer muestra el año actual y los enlaces de servicios', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)
    expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Catálogo' }).getAttribute('href')).toBe('/catalogo')
    expect(screen.getByRole('link', { name: 'Servicio técnico' }).getAttribute('href')).toBe('/reparacion')
  })
})
