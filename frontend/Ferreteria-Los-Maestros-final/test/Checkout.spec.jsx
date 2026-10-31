// PRUEBAS DE COMPONENTE — Checkout (datos del cliente, validaciones, pago exitoso y pago fallido)
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import Checkout from '../src/pages/Checkout.jsx'
import CompraExitosa from '../src/pages/CompraExitosa.jsx'
import CompraFallida from '../src/pages/CompraFallida.jsx'
import { renderApp, loginAs, setStock, CLIENTE } from './helpers.jsx'

const conCarrito = (items) => localStorage.setItem('flm_cart', JSON.stringify(items))
const ordenes = () => JSON.parse(localStorage.getItem('flm_orders') || '[]')
const montar = () =>
  renderApp(
    <Routes>
      <Route path="/carrito" element={<p>Pantalla carrito</p>} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/compra-exitosa/:id" element={<CompraExitosa />} />
      <Route path="/compra-fallida" element={<CompraFallida />} />
    </Routes>,
    { route: '/checkout' }
  )

// Completa lo mínimo para poder pagar con despacho y tarjeta
async function completarPago(user, tarjeta = '4111 1111 1111 1111') {
  await user.type(screen.getByLabelText('Calle'), 'Los Alerces 123')
  await user.selectOptions(screen.getByLabelText('Comuna'), 'Providencia')
  await user.type(screen.getByLabelText('Número de tarjeta'), tarjeta)
}

describe('Checkout — acceso y datos iniciales', () => {
  beforeEach(() => { loginAs(CLIENTE); conCarrito([{ id: 1, qty: 2 }]) })

  it('con el carrito vacío vuelve al carrito', () => {
    conCarrito([])
    montar()
    expect(screen.getByText('Pantalla carrito')).toBeInTheDocument()
  })
})

describe('Checkout — validaciones', () => {
  beforeEach(() => { loginAs(CLIENTE); conCarrito([{ id: 1, qty: 1 }]) })

  it('con despacho exige calle y comuna, y no registra la compra', async () => {
    montar()
    await userEvent.setup().click(screen.getByRole('button', { name: /Pagar ahora/ }))
    expect(screen.getByText('Ingresa la calle y el número')).toBeInTheDocument()
    expect(screen.getByText('Selecciona una comuna')).toBeInTheDocument()
    expect(ordenes()).toEqual([])
  })
})

describe('Checkout — pago exitoso', () => {
  beforeEach(() => { loginAs(CLIENTE); conCarrito([{ id: 1, qty: 2 }]) })

  it('registra la orden, descuenta stock, vacía el carrito y muestra el comprobante', async () => {
    montar()
    const user = userEvent.setup()
    await completarPago(user)
    await user.click(screen.getByRole('button', { name: /Pagar ahora/ }))

    expect(await screen.findByRole('heading', { name: /Se ha realizado la compra nro #C-1001/ })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('flm_stock'))['1']).toBe(78)
    expect(JSON.parse(localStorage.getItem('flm_cart'))).toEqual([])
    expect(ordenes()[0].estado).toBe('En preparación')
  })
})

describe('Checkout — pago fallido', () => {
  beforeEach(() => { loginAs(CLIENTE); conCarrito([{ id: 1, qty: 2 }]) })

  it('una tarjeta terminada en 0000 es rechazada: no hay orden ni descuento de stock', async () => {
    montar()
    const user = userEvent.setup()
    await completarPago(user, '4000 0000 0000 0000')
    await user.click(screen.getByRole('button', { name: /Pagar ahora/ }))

    expect(await screen.findByRole('heading', { name: /No se pudo realizar el pago/ })).toBeInTheDocument()
    expect(screen.getByText(/rechazó la tarjeta/)).toBeInTheDocument()
    expect(ordenes()).toEqual([])
    expect(localStorage.getItem('flm_stock')).toBe('{}')
    expect(JSON.parse(localStorage.getItem('flm_cart'))).toEqual([{ id: 1, qty: 2 }]) // el carrito se conserva
  })
})
