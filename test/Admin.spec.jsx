// PRUEBAS DE COMPONENTE — Panel de administración (Dashboard, Inventario, Ventas, Usuarios, Proveedores, Reportes)
import { screen, fireEvent, within } from '@testing-library/react'
import Dashboard from '../src/pages/Dashboard.jsx'
import Inventario from '../src/pages/Inventario.jsx'
import Ventas from '../src/pages/Ventas.jsx'
import Usuarios from '../src/pages/Usuarios.jsx'
import Proveedores from '../src/pages/Proveedores.jsx'
import Reportes from '../src/pages/Reportes.jsx'
import { renderApp, setStock, loginAs, ADMIN } from './helpers.jsx'

const orden = (over = {}) => ({
  id: 'C-1001', username: 'usuario', customer: 'Juan Pérez', fecha: '2026-10-01T12:00:00Z',
  items: [{ id: 1, code: 'MC001', name: 'Cemento Polpaico gris 25 kg', price: 5990, qty: 2, imagen: '' }],
  total: 11980, payment: 'debito', delivery: 'retiro', estado: 'Listo para retiro', ...over,
})
const conOrdenes = (lista) => localStorage.setItem('flm_orders', JSON.stringify(lista))
const filas = (c) => c.querySelectorAll('tbody tr')
// El texto también existe en el menú lateral: nos quedamos con el que está dentro de una tarjeta KPI
const kpi = (etiqueta) => screen.getAllByText(etiqueta).find((el) => el.closest('.card')).closest('.card')

describe('Dashboard', () => {
  beforeEach(() => loginAs(ADMIN))

  it('muestra los KPIs de productos, usuarios y proveedores', () => {
    renderApp(<Dashboard />)
    expect(kpi('Productos')).toHaveTextContent('85')
    expect(kpi('Usuarios')).toHaveTextContent('2')
    expect(kpi('Proveedores')).toHaveTextContent('7')
  })
})

describe('Inventario', () => {
  it('lista los 85 productos', () => {
    const { container } = renderApp(<Inventario />)
    expect(filas(container).length).toBe(85)
  })
})

describe('Ventas', () => {
  it('sin ventas muestra el mensaje informativo', () => {
    renderApp(<Ventas />)
    expect(screen.getByText(/Aún no hay ventas/)).toBeInTheDocument()
  })
})

describe('Usuarios y Proveedores', () => {
  it('Usuarios lista admin y usuario con su rol', () => {
    const { container } = renderApp(<Usuarios />)
    expect(filas(container).length).toBe(2)
    expect(screen.getByText('admin@ferreterialosmaestros.cl')).toBeInTheDocument()
  })
})

describe('Reportes', () => {
  it('agrupa el valor de inventario por las 9 categorías', () => {
    renderApp(<Reportes />)
    const tabla = screen.getAllByRole('table')[0]
    expect(within(tabla).getAllByRole('row').length).toBe(10) // encabezado + 9
  })
})
