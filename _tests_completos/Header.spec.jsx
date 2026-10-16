// PRUEBAS DE COMPONENTE — Header (Navbar + Catbar): sesión, carrito, búsqueda y categorías
import { screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLocation } from 'react-router-dom'
import Header from '../src/components/Header.jsx'
import { renderApp, loginAs, ADMIN, CLIENTE } from './helpers.jsx'

// Componente auxiliar: muestra la URL actual para comprobar la navegación
function Ubicacion() {
  const l = useLocation()
  return <output data-testid="ubicacion">{l.pathname + l.search}</output>
}
const montar = (route = '/') => renderApp(<><Header /><Ubicacion /></>, { route })

describe('Header — sesión', () => {
  it('sin sesión muestra "Cuenta" que lleva a /login', () => {
    montar()
    expect(screen.getByRole('link', { name: /Cuenta/ }).getAttribute('href')).toBe('/login')
  })

  it('con sesión muestra el primer nombre del usuario', () => {
    loginAs(CLIENTE)
    montar()
    expect(screen.getByText('Juan')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Cuenta/ })).toBeNull()
  })

  it('el enlace "Admin" solo aparece para administradores', () => {
    loginAs(CLIENTE)
    const { unmount } = montar()
    expect(screen.queryByRole('link', { name: /^Admin$/ })).toBeNull()
    unmount()
    localStorage.clear()
    loginAs(ADMIN)
    montar()
    expect(screen.getByRole('link', { name: /Admin/ }).getAttribute('href')).toBe('/dashboard')
  })

  it('cerrar sesión desde el menú borra la sesión y vuelve al inicio', async () => {
    loginAs(CLIENTE)
    montar('/catalogo')
    const user = userEvent.setup()
    await user.click(screen.getByText('Juan'))
    await user.click(await screen.findByText('Cerrar sesión'))
    expect(localStorage.getItem('currentUser')).toBeNull()
    expect(screen.getByTestId('ubicacion')).toHaveTextContent('/')
    expect(screen.getByRole('link', { name: /Cuenta/ })).toBeInTheDocument()
  })
})

describe('Header — carrito', () => {
  it('no muestra insignia si el carrito está vacío', () => {
    const { container } = montar()
    expect(container.querySelector('.badge-cart')).toBeNull()
  })

  it('muestra la cantidad total de unidades en la insignia del carrito', () => {
    localStorage.setItem('flm_cart', JSON.stringify([{ id: 1, qty: 3 }, { id: 2, qty: 2 }]))
    const { container } = montar()
    expect(container.querySelector('.badge-cart').textContent).toBe('5')
  })
})

describe('Header — búsqueda', () => {
  it('buscar navega a /catalogo?q=<término>', () => {
    montar()
    const input = screen.getAllByRole('searchbox')[0]
    fireEvent.change(input, { target: { value: 'taladro' } })
    fireEvent.submit(screen.getAllByRole('search')[0])
    expect(screen.getByTestId('ubicacion')).toHaveTextContent('/catalogo?q=taladro')
  })

  it('una búsqueda vacía lleva al catálogo completo', () => {
    montar()
    fireEvent.submit(screen.getAllByRole('search')[0])
    expect(screen.getByTestId('ubicacion').textContent).toBe('/catalogo')
  })

  it('codifica caracteres especiales en la URL', () => {
    montar()
    fireEvent.change(screen.getAllByRole('searchbox')[0], { target: { value: 'cañería 1/2' } })
    fireEvent.submit(screen.getAllByRole('search')[0])
    expect(screen.getByTestId('ubicacion').textContent).toContain(encodeURIComponent('cañería 1/2'))
  })

  it('el buscador se sincroniza con el parámetro q de la URL', () => {
    montar('/catalogo?q=pintura')
    expect(screen.getAllByRole('searchbox')[0].value).toBe('pintura')
  })
})

describe('Header — barra de categorías (Catbar)', () => {
  it('lista las 9 categorías', () => {
    montar()
    const barra = document.querySelector('.flm-catnav')
    expect(within(barra).getAllByRole('link').length).toBe(9)
  })

  it('cada categoría enlaza al catálogo filtrado', () => {
    montar()
    expect(screen.getByRole('link', { name: 'Herramientas' }).getAttribute('href')).toBe('/catalogo?cat=herramientas')
  })

  it('resalta la categoría activa según la URL', () => {
    montar('/catalogo?cat=pinturas')
    expect(screen.getByRole('link', { name: 'Pinturas y Recubrimientos' }).className).toContain('active')
    expect(screen.getByRole('link', { name: 'Herramientas' }).className).not.toContain('active')
  })

  it('fuera del catálogo no hay categoría activa', () => {
    montar('/')
    const activos = document.querySelectorAll('.flm-catnav .nav-link.active')
    expect(activos.length).toBe(0)
  })
})
