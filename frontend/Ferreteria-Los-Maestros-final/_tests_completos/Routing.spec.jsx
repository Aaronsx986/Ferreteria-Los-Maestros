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

  it('con sesión de cliente muestra la ruta protegida', () => {
    loginAs(CLIENTE)
    montar(false)
    expect(screen.getByText('Contenido secreto')).toBeInTheDocument()
  })

  it('ruta solo-admin: un cliente es enviado al inicio', () => {
    loginAs(CLIENTE)
    montar(true)
    expect(screen.getByText('Pantalla inicio')).toBeInTheDocument()
    expect(screen.queryByText('Contenido secreto')).toBeNull()
  })

  it('ruta solo-admin: el administrador sí accede', () => {
    loginAs(ADMIN)
    montar(true)
    expect(screen.getByText('Contenido secreto')).toBeInTheDocument()
  })

  it('ruta solo-admin sin sesión también va a /login', () => {
    montar(true)
    expect(screen.getByText('Pantalla login')).toBeInTheDocument()
  })
})

describe('AdminSidebar', () => {
  it('muestra los 6 enlaces del panel de administración', () => {
    render(<MemoryRouter><AdminSidebar /></MemoryRouter>)
    expect(screen.getAllByRole('link').map((a) => a.textContent.trim()))
      .toEqual(['Dashboard', 'Inventario', 'Ventas', 'Usuarios', 'Proveedores', 'Reportes'])
  })

  it('marca como activo el enlace de la ruta actual', () => {
    render(<MemoryRouter initialEntries={['/ventas']}><AdminSidebar /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /Ventas/ }).className).toContain('active')
    expect(screen.getByRole('link', { name: /Dashboard/ }).className).not.toContain('active')
  })
})

describe('Footer y Topbar', () => {
  it('Footer muestra el año actual y los enlaces de servicios', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)
    expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Catálogo' }).getAttribute('href')).toBe('/catalogo')
    expect(screen.getByRole('link', { name: 'Servicio técnico' }).getAttribute('href')).toBe('/reparacion')
  })

  it('Topbar enlaza a Servicio Técnico y Arriendo', () => {
    render(<MemoryRouter><Topbar /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /Servicio Técnico/ }).getAttribute('href')).toBe('/reparacion')
    expect(screen.getByRole('link', { name: /Arriendo de Herramientas/ }).getAttribute('href')).toBe('/arriendo')
  })
})
