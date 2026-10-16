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

  it('calcula el total del pedido (5.990×2 + 7.490)', () => {
    montar()
    const resumen = screen.getByText('Resumen del pedido').closest('.card')
    expect(within(resumen).getByText('$19.470')).toBeInTheDocument()
  })

  it('el botón "+" aumenta la cantidad y recalcula el total', () => {
    montar()
    fireEvent.click(screen.getAllByLabelText('Agregar uno')[0])
    const resumen = screen.getByText('Resumen del pedido').closest('.card')
    expect(within(resumen).getByText('$25.460')).toBeInTheDocument()
  })

  it('el botón "−" disminuye y al llegar a 0 quita el producto', () => {
    montar()
    fireEvent.click(screen.getAllByLabelText('Quitar uno')[1]) // Cemento Melón: 1 -> 0
    expect(screen.queryByText('Cemento Melón blanco 25 kg')).toBeNull()
  })

  it('"+" se deshabilita al llegar al stock y avisa "Máx. disponible"', () => {
    setStock({ 1: 2 })
    montar()
    expect(screen.getAllByLabelText('Agregar uno')[0]).toBeDisabled()
    expect(screen.getByText('Máx. disponible')).toBeInTheDocument()
  })

  it('el botón de papelera elimina el producto', () => {
    montar()
    fireEvent.click(screen.getAllByLabelText('Eliminar')[0])
    expect(screen.queryByText('Cemento Polpaico gris 25 kg')).toBeNull()
  })

  it('"Vaciar carrito" deja el carrito vacío', () => {
    montar()
    fireEvent.click(screen.getByRole('button', { name: 'Vaciar carrito' }))
    expect(screen.getByText('Tu carrito está vacío.')).toBeInTheDocument()
  })
})

describe('Carrito — ir a pagar', () => {
  beforeEach(() => { loginAs(CLIENTE); conCarrito([{ id: 1, qty: 2 }]) })

  it('el botón "Ir a pagar" lleva al checkout', () => {
    montar()
    fireEvent.click(screen.getByRole('link', { name: /Ir a pagar/ }))
    expect(screen.getByText('Pantalla checkout')).toBeInTheDocument()
  })

  it('el carrito ya no registra la compra: eso lo hace el checkout', () => {
    montar()
    expect(screen.queryByRole('button', { name: /Confirmar compra/ })).toBeNull()
    expect(localStorage.getItem('flm_orders')).toBe('[]')
  })

  it('"Seguir comprando" vuelve al catálogo', () => {
    montar()
    expect(screen.getByRole('link', { name: 'Seguir comprando' }).getAttribute('href')).toBe('/catalogo')
  })
})
