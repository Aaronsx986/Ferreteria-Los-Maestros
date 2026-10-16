// PRUEBAS DE COMPONENTE — Panel de administración: crear, editar y eliminar (Inventario, Usuarios, Proveedores)
import { screen, fireEvent, within } from '@testing-library/react'
import Inventario from '../src/pages/Inventario.jsx'
import Usuarios from '../src/pages/Usuarios.jsx'
import Proveedores from '../src/pages/Proveedores.jsx'
import Dashboard from '../src/pages/Dashboard.jsx'
import { renderApp, loginAs, ADMIN } from './helpers.jsx'

const llenar = (campos) =>
  Object.entries(campos).forEach(([etiqueta, valor]) =>
    fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } })
  )
const filas = () => document.querySelectorAll('tbody tr')
const modal = () => screen.getByRole('dialog')

describe('Inventario — crear producto', () => {
  beforeEach(() => loginAs(ADMIN))
  const nuevo = {
    'Código': 'ZZ001', 'Nombre': 'Producto de prueba', 'Categoría': 'madera', 'Subcategoría': 'Varios', 'Marca': 'Marca X',
    'Unidad de venta': 'Unidad', 'Precio de compra': '500', 'Precio de venta': '1000', 'Stock': '10', 'Stock mínimo': '2',
  }

  it('"Nuevo producto" abre el formulario vacío', () => {
    renderApp(<Inventario />)
    fireEvent.click(screen.getByRole('button', { name: /Nuevo producto/ }))
    expect(within(modal()).getByText('Nuevo producto')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre').value).toBe('')
  })
})

describe('Inventario — editar y eliminar', () => {
  beforeEach(() => loginAs(ADMIN))
  it('"Editar" abre el formulario con los datos del producto', () => {
    renderApp(<Inventario />)
    fireEvent.click(screen.getByLabelText('Editar Cemento Polpaico gris 25 kg'))
    expect(screen.getByLabelText('Código').value).toBe('MC001')
    expect(screen.getByLabelText('Precio de venta').value).toBe('5990')
    expect(screen.getByLabelText('Stock').value).toBe('80')
  })
})

describe('Usuarios — crear, editar y eliminar', () => {
  beforeEach(() => loginAs(ADMIN))
  const nuevo = { 'Nombre completo': 'Ana Rojas', 'Usuario': 'arojas', 'Correo electrónico': 'ana@correo.cl', 'Contraseña': 'secreto1' }

  it('crea un usuario válido y aparece en la tabla', () => {
    renderApp(<Usuarios />)
    fireEvent.click(screen.getByRole('button', { name: /Nuevo usuario/ }))
    llenar({ ...nuevo, 'Rol': 'admin' })
    fireEvent.click(screen.getByRole('button', { name: 'Crear usuario' }))
    expect(screen.getByText('Ana Rojas')).toBeInTheDocument()
    expect(screen.getByText('Usuario "arojas" creado.')).toBeInTheDocument()
    expect(filas().length).toBe(3)
  })
})

describe('Proveedores — crear, editar y eliminar', () => {
  beforeEach(() => loginAs(ADMIN))
  const nuevo = {
    'Nombre del proveedor': 'Distribuidora Nueva', 'Contacto': 'Pedro Soto', 'Correo del contacto': 'pedro@nueva.cl',
    'Condiciones de pago': '30 días', 'Plazo de entrega': '3 días hábiles', 'Evaluación (0 a 5)': '4.2',
  }

  it('crea un proveedor y aparece en la tabla', () => {
    renderApp(<Proveedores />)
    fireEvent.click(screen.getByRole('button', { name: /Nuevo proveedor/ }))
    llenar(nuevo)
    fireEvent.click(screen.getByRole('button', { name: 'Crear proveedor' }))
    expect(screen.getByText('Distribuidora Nueva')).toBeInTheDocument()
    expect(filas().length).toBe(8)
  })
})

describe('Dashboard — refleja los cambios del CRUD', () => {
  beforeEach(() => loginAs(ADMIN))

  it('el KPI de proveedores lee del estado guardado, no del JSON', () => {
    localStorage.setItem('flm_suppliers', JSON.stringify([{ id: 1, name: 'Único', contact: { name: 'a', email: 'a@a.cl' }, paymentTerms: '', deliveryTime: '', rating: 5, status: 'active' }]))
    renderApp(<Dashboard />)
    const kpi = screen.getAllByText('Proveedores').find((el) => el.closest('.card')).closest('.card')
    expect(kpi.textContent).toContain('1')
    expect(kpi.textContent).not.toContain('7')
  })
})
