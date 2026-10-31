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
})

describe('Header — carrito', () => {
  it('no muestra insignia si el carrito está vacío', () => {
    const { container } = montar()
    expect(container.querySelector('.badge-cart')).toBeNull()
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
})

describe('Header — barra de categorías (Catbar)', () => {
  it('lista las 9 categorías', () => {
    montar()
    const barra = document.querySelector('.flm-catnav')
    expect(within(barra).getAllByRole('link').length).toBe(9)
  })
})
