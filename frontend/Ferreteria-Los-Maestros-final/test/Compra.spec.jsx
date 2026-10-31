// PRUEBAS DE COMPONENTE — Pantallas de resultado de la compra (exitosa y fallida) y página 404
import { screen, fireEvent } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import CompraExitosa from '../src/pages/CompraExitosa.jsx'
import CompraFallida from '../src/pages/CompraFallida.jsx'
import NoEncontrada from '../src/pages/NoEncontrada.jsx'
import { renderApp, loginAs, ADMIN, CLIENTE } from './helpers.jsx'

const orden = (over = {}) => ({
  id: 'C-1001', username: 'usuario', customer: 'Juan Pérez', fecha: '2026-10-01T12:00:00Z',
  items: [{ id: 1, code: 'MC001', name: 'Cemento Polpaico gris 25 kg', price: 5990, qty: 2, imagen: '' }],
  total: 11980, payment: 'debito', delivery: 'despacho', estado: 'En preparación',
  shipping: {
    nombre: 'Juan', apellido: 'Pérez', correo: 'juan@correo.cl', calle: 'Los Alerces 123',
    departamento: '603', region: 'Región Metropolitana de Santiago', comuna: 'Providencia', indicaciones: 'Casa azul',
  },
  ...over,
})
const guardar = (o) => localStorage.setItem('flm_orders', JSON.stringify([o]))
const montarExito = (id = 'C-1001') =>
  renderApp(
    <Routes><Route path="/compra-exitosa/:id" element={<CompraExitosa />} /></Routes>,
    { route: `/compra-exitosa/${id}` }
  )

describe('CompraExitosa', () => {
  beforeEach(() => loginAs(CLIENTE))

  it('muestra el número de compra, el cliente, la dirección y el detalle', () => {
    guardar(orden())
    montarExito()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Se ha realizado la compra nro #C-1001')
    expect(screen.getByText('juan@correo.cl')).toBeInTheDocument()
    expect(screen.getByText('Los Alerces 123')).toBeInTheDocument()
    expect(screen.getByText('Providencia')).toBeInTheDocument()
    expect(screen.getByText('Cemento Polpaico gris 25 kg')).toBeInTheDocument()
    expect(screen.getByText('Total pagado: $11.980')).toBeInTheDocument()
  })
})

describe('CompraFallida', () => {
  const estado = {
    motivo: 'Tu banco rechazó la tarjeta.', ref: 'P-123456', total: 11980,
    items: [{ id: 1, name: 'Cemento Polpaico gris 25 kg', price: 5990, qty: 2, imagen: '' }],
    form: { nombre: 'Juan', apellido: 'Pérez', correo: 'juan@correo.cl', delivery: 'despacho', calle: 'Los Alerces 123', region: 'Región Metropolitana de Santiago', comuna: 'Providencia' },
  }
  const montar = (state) =>
    renderApp(
      <Routes>
        <Route path="/carrito" element={<p>Pantalla carrito</p>} />
        <Route path="/checkout" element={<p>Pantalla checkout</p>} />
        <Route path="/compra-fallida" element={<CompraFallida />} />
      </Routes>,
      { route: { pathname: '/compra-fallida', state } }
    )

  it('muestra el número, el motivo y el detalle de la compra', () => {
    montar(estado)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('No se pudo realizar el pago. nro #P-123456')
    expect(screen.getByText('Tu banco rechazó la tarjeta.')).toBeInTheDocument()
    expect(screen.getByText('Cemento Polpaico gris 25 kg')).toBeInTheDocument()
    expect(screen.getByText('Total pagado: $11.980')).toBeInTheDocument()
  })
})

describe('NoEncontrada (404)', () => {
  it('muestra el mensaje y los enlaces de salida', () => {
    renderApp(<NoEncontrada />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('404')
    expect(screen.getByRole('link', { name: 'Ir al inicio' }).getAttribute('href')).toBe('/')
    expect(screen.getByRole('link', { name: 'Ver catálogo' }).getAttribute('href')).toBe('/catalogo')
  })
})
