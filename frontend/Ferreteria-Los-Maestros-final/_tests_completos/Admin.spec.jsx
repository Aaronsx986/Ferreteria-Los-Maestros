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

  it('calcula el valor total del inventario (Σ precio × stock)', () => {
    renderApp(<Dashboard />)
    expect(screen.getByText('$15.423.240')).toBeInTheDocument()
  })

  it('cuenta "Stock bajo" cuando el stock ≤ mínimo', () => {
    setStock({ 1: 20, 2: 0 }) // mínimo de ambos: 20 y 10
    renderApp(<Dashboard />)
    expect(kpi('Stock bajo')).toHaveTextContent('2')
  })

  it('suma ventas e ingresos reales a partir de las órdenes', () => {
    conOrdenes([orden(), orden({ id: 'C-1002', total: 8000 })])
    renderApp(<Dashboard />)
    expect(kpi('Ventas realizadas')).toHaveTextContent('2')
    expect(kpi('Ingresos')).toHaveTextContent('$19.980')
  })

  it('incluye el menú lateral de administración', () => {
    renderApp(<Dashboard />)
    expect(screen.getByRole('link', { name: /Reportes/ })).toBeInTheDocument()
  })
})

describe('Inventario', () => {
  it('lista los 85 productos', () => {
    const { container } = renderApp(<Inventario />)
    expect(filas(container).length).toBe(85)
  })

  it('filtra por código o nombre (sin importar tildes)', () => {
    const { container } = renderApp(<Inventario />)
    fireEvent.change(screen.getByPlaceholderText(/Buscar por código/), { target: { value: 'mc001' } })
    expect(filas(container).length).toBe(1)
    fireEvent.change(screen.getByPlaceholderText(/Buscar por código/), { target: { value: 'ceramica' } })
    expect(filas(container).length).toBeGreaterThan(0)
  })

  it('"Solo stock bajo / agotado" muestra solo los críticos y sus etiquetas', () => {
    setStock({ 1: 20, 2: 0 })
    const { container } = renderApp(<Inventario />)
    fireEvent.click(screen.getByLabelText(/Solo stock bajo/))
    expect(filas(container).length).toBe(2)
    expect(screen.getByText('Stock bajo')).toBeInTheDocument()
    expect(screen.getByText('Agotado')).toBeInTheDocument()
  })

  it('un producto con stock normal aparece como "OK"', () => {
    renderApp(<Inventario />)
    expect(screen.getAllByText('OK').length).toBe(85)
  })
})

describe('Ventas', () => {
  it('sin ventas muestra el mensaje informativo', () => {
    renderApp(<Ventas />)
    expect(screen.getByText(/Aún no hay ventas/)).toBeInTheDocument()
  })

  it('lista las ventas registradas con cliente y total', () => {
    conOrdenes([orden()])
    renderApp(<Ventas />)
    expect(screen.getByText('C-1001')).toBeInTheDocument()
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('$11.980')).toBeInTheDocument()
  })

  it('busca por cliente, ID o producto', () => {
    conOrdenes([orden(), orden({ id: 'C-1002', customer: 'María Soto', items: [{ id: 20, name: 'Martillo carpintero 500g', price: 7990, qty: 1 }], total: 7990 })])
    const { container } = renderApp(<Ventas />)
    fireEvent.change(screen.getByPlaceholderText(/Buscar cliente/), { target: { value: 'martillo' } })
    expect(filas(container).length).toBe(1)
    expect(screen.getByText('María Soto')).toBeInTheDocument()
  })

  it('si la búsqueda no coincide, avisa que no hay resultados', () => {
    conOrdenes([orden()])
    renderApp(<Ventas />)
    fireEvent.change(screen.getByPlaceholderText(/Buscar cliente/), { target: { value: 'zzz' } })
    expect(screen.getByText('Ninguna venta coincide con la búsqueda.')).toBeInTheDocument()
  })
})

describe('Usuarios y Proveedores', () => {
  it('Usuarios lista admin y usuario con su rol', () => {
    const { container } = renderApp(<Usuarios />)
    expect(filas(container).length).toBe(2)
    expect(screen.getByText('admin@ferreterialosmaestros.cl')).toBeInTheDocument()
  })

  it('Usuarios filtra por nombre o usuario', () => {
    const { container } = renderApp(<Usuarios />)
    fireEvent.change(screen.getByPlaceholderText('Buscar usuario...'), { target: { value: 'ADMIN' } })
    expect(filas(container).length).toBe(1)
  })

  it('Usuarios incluye cuentas registradas desde "Crear usuario"', () => {
    localStorage.setItem('flm_users', JSON.stringify([{ username: 'nuevo', name: 'Nuevo Cliente', email: 'n@n.cl', role: 'user', status: 'active' }]))
    const { container } = renderApp(<Usuarios />)
    expect(filas(container).length).toBe(3)
  })

  it('Proveedores lista los 7 con su estado', () => {
    const { container } = renderApp(<Proveedores />)
    expect(filas(container).length).toBe(7)
    expect(screen.getAllByText('Activo').length).toBe(6)
    expect(screen.getAllByText('Pendiente').length).toBe(1)
  })

  it('Proveedores filtra por nombre', () => {
    const { container } = renderApp(<Proveedores />)
    fireEvent.change(screen.getByPlaceholderText('Buscar proveedor...'), { target: { value: 'polpaico' } })
    expect(filas(container).length).toBe(1)
  })
})

describe('Reportes', () => {
  it('agrupa el valor de inventario por las 9 categorías', () => {
    renderApp(<Reportes />)
    const tabla = screen.getAllByRole('table')[0]
    expect(within(tabla).getAllByRole('row').length).toBe(10) // encabezado + 9
  })

  it('sin ventas muestra el aviso', () => {
    renderApp(<Reportes />)
    expect(screen.getByText('Todavía no hay ventas registradas.')).toBeInTheDocument()
  })

  it('con ventas agrupa unidades e ingresos por producto, de mayor a menor', () => {
    conOrdenes([
      orden(),
      orden({ id: 'C-1002', items: [{ id: 1, name: 'Cemento Polpaico gris 25 kg', price: 5990, qty: 1 }, { id: 20, name: 'Martillo carpintero 500g', price: 7990, qty: 5 }], total: 45940 }),
    ])
    renderApp(<Reportes />)
    const tabla = screen.getAllByRole('table')[1]
    const rows = within(tabla).getAllByRole('row').slice(1)
    expect(rows[0]).toHaveTextContent('Martillo carpintero 500g') // $39.950
    expect(rows[1]).toHaveTextContent('Cemento Polpaico gris 25 kg') // 3 u. = $17.970
    expect(rows[1]).toHaveTextContent('3')
  })
})
