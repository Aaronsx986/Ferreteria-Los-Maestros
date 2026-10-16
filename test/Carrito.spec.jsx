// PRUEBAS DE COMPONENTE — Carrito (resumen, cantidades y paso al checkout)
import { screen, fireEvent, within } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import Carrito from '../src/pages/Carrito.jsx'
import { renderApp, loginAs, setStock, CLIENTE } from './helpers.jsx'

const conCarrito = (items) => localStorage.setItem('flm_cart', JSON.stringify(items))
const montar = () =>
  renderApp(
    <Routes>
      <Route path="/carrito" element={<Carrito />} />
      <Route path="/checkout" element={<p>Pantalla checkout</p>} />
    </Routes>,
    { route: '/carrito' }
  )

describe('Carrito — vacío', () => {
  it('muestra el mensaje y el enlace al catálogo', () => {
    montar()
    expect(screen.getByText('Tu carrito está vacío.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir al catálogo' }).getAttribute('href')).toBe('/catalogo')
  })
})

describe('Carrito — con productos', () => {
  beforeEach(() => { loginAs(CLIENTE); conCarrito([{ id: 1, qty: 2 }, { id: 2, qty: 1 }]) })

  it('lista cada producto con su cantidad', () => {
    montar()
    expect(screen.getByText('Cemento Polpaico gris 25 kg')).toBeInTheDocument()
    expect(screen.getByText('Cemento Melón blanco 25 kg')).toBeInTheDocument()
  })
})

describe('Carrito — ir a pagar', () => {
  beforeEach(() => { loginAs(CLIENTE); conCarrito([{ id: 1, qty: 2 }]) })

  it('el botón "Ir a pagar" lleva al checkout', () => {
    montar()
    fireEvent.click(screen.getByRole('link', { name: /Ir a pagar/ }))
    expect(screen.getByText('Pantalla checkout')).toBeInTheDocument()
  })
})
