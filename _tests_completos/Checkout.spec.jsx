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

  it('completa nombre, apellido y correo con los datos de la sesión', () => {
    montar()
    expect(screen.getByLabelText('Nombre').value).toBe('Juan')
    expect(screen.getByLabelText('Apellido').value).toBe('Pérez')
    expect(screen.getByLabelText('Correo electrónico').value).toBe('usuario@ferreterialosmaestros.cl')
  })

  it('muestra el resumen del pedido y el total a pagar (5.990 × 2)', () => {
    montar()
    expect(screen.getByText('Cemento Polpaico gris 25 kg')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Pagar ahora \$11\.980/ })).toBeInTheDocument()
  })

  it('el retiro en tienda oculta la dirección', async () => {
    montar()
    expect(screen.getByLabelText('Calle')).toBeInTheDocument()
    await userEvent.setup().selectOptions(screen.getByLabelText('Tipo de entrega'), 'retiro')
    expect(screen.queryByLabelText('Calle')).toBeNull()
  })

  it('las comunas dependen de la región elegida', async () => {
    montar()
    const user = userEvent.setup()
    expect(screen.getByRole('option', { name: 'Providencia' })).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Región'), 'Región de Valparaíso')
    expect(screen.queryByRole('option', { name: 'Providencia' })).toBeNull()
    expect(screen.getByRole('option', { name: 'Viña del Mar' })).toBeInTheDocument()
  })

  it('el número de tarjeta solo se pide con débito o crédito', async () => {
    montar()
    const user = userEvent.setup()
    expect(screen.getByLabelText('Número de tarjeta')).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Forma de pago'), 'transferencia')
    expect(screen.queryByLabelText('Número de tarjeta')).toBeNull()
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

  it('exige una tarjeta de 16 dígitos', async () => {
    montar()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Calle'), 'Los Alerces 123')
    await user.selectOptions(screen.getByLabelText('Comuna'), 'Providencia')
    await user.type(screen.getByLabelText('Número de tarjeta'), '1234')
    await user.click(screen.getByRole('button', { name: /Pagar ahora/ }))
    expect(screen.getByText('La tarjeta debe tener 16 dígitos')).toBeInTheDocument()
  })

  it('un correo inválido o un nombre vacío muestran su error', async () => {
    montar()
    const user = userEvent.setup()
    await user.clear(screen.getByLabelText('Nombre'))
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'no-es-correo' } })
    await user.click(screen.getByRole('button', { name: /Pagar ahora/ }))
    expect(screen.getByText('Ingresa tu nombre')).toBeInTheDocument()
    expect(screen.getByText('Ingresa un correo válido')).toBeInTheDocument()
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

  it('guarda los datos del cliente y la dirección en la orden', async () => {
    montar()
    const user = userEvent.setup()
    await completarPago(user)
    await user.click(screen.getByRole('button', { name: /Pagar ahora/ }))
    await screen.findByRole('heading', { name: /Se ha realizado la compra/ })
    const { shipping } = ordenes()[0]
    expect(shipping.nombre).toBe('Juan')
    expect(shipping.calle).toBe('Los Alerces 123')
    expect(shipping.comuna).toBe('Providencia')
  })

  it('el número de tarjeta NO se guarda en ninguna parte', async () => {
    montar()
    const user = userEvent.setup()
    await completarPago(user, '4111111111111111')
    await user.click(screen.getByRole('button', { name: /Pagar ahora/ }))
    await screen.findByRole('heading', { name: /Se ha realizado la compra/ })
    expect(localStorage.getItem('flm_orders')).not.toContain('4111')
  })

  it('retiro en tienda + efectivo: no pide dirección ni tarjeta y queda "Listo para retiro"', async () => {
    montar()
    const user = userEvent.setup()
    await user.selectOptions(screen.getByLabelText('Tipo de entrega'), 'retiro')
    await user.selectOptions(screen.getByLabelText('Forma de pago'), 'efectivo')
    await user.click(screen.getByRole('button', { name: /Pagar ahora/ }))
    expect(await screen.findByText(/Se ha realizado la compra/)).toBeInTheDocument()
    expect(ordenes()[0].estado).toBe('Listo para retiro')
    expect(ordenes()[0].payment).toBe('efectivo')
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

  it('"Volver a realizar el pago" regresa al checkout con los datos ya escritos y sin la tarjeta', async () => {
    montar()
    const user = userEvent.setup()
    await completarPago(user, '4000 0000 0000 0000')
    await user.click(screen.getByRole('button', { name: /Pagar ahora/ }))
    await user.click(await screen.findByRole('button', { name: 'VOLVER A REALIZAR EL PAGO' }))

    expect(await screen.findByRole('heading', { name: 'Finalizar compra' })).toBeInTheDocument()
    expect(screen.getByLabelText('Calle').value).toBe('Los Alerces 123')
    expect(screen.getByLabelText('Número de tarjeta').value).toBe('')
  })

  it('si no hay stock suficiente, termina en pago fallido con el motivo y sin orden', async () => {
    setStock({ 1: 1 }) // otro cliente compró antes: queda 1 y el carrito pide 2
    montar()
    const user = userEvent.setup()
    await completarPago(user)
    await user.click(screen.getByRole('button', { name: /Pagar ahora/ }))
    expect(await screen.findByRole('heading', { name: /No se pudo realizar el pago/ })).toBeInTheDocument()
    expect(screen.getByText(/No hay stock suficiente/)).toBeInTheDocument()
    expect(ordenes()).toEqual([])
  })
})
