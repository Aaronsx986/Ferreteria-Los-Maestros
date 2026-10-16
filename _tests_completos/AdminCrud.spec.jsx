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

  it('enviar vacío muestra los errores y NO crea el producto', () => {
    renderApp(<Inventario />)
    fireEvent.click(screen.getByRole('button', { name: /Nuevo producto/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Crear producto' }))
    expect(screen.getByText('El código es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('Selecciona una categoría')).toBeInTheDocument()
    expect(filas().length).toBe(85)
  })

  it('con datos válidos lo agrega a la tabla, cierra el formulario y avisa', () => {
    renderApp(<Inventario />)
    fireEvent.click(screen.getByRole('button', { name: /Nuevo producto/ }))
    llenar(nuevo)
    fireEvent.click(screen.getByRole('button', { name: 'Crear producto' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(filas().length).toBe(86)
    expect(screen.getByText('Producto "Producto de prueba" creado.')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('flm_catalog')).length).toBe(86)
  })

  it('rechaza un código que ya existe', () => {
    renderApp(<Inventario />)
    fireEvent.click(screen.getByRole('button', { name: /Nuevo producto/ }))
    llenar({ ...nuevo, 'Código': 'MC001' })
    fireEvent.click(screen.getByRole('button', { name: 'Crear producto' }))
    expect(screen.getByText('Ya existe un producto con ese código')).toBeInTheDocument()
    expect(filas().length).toBe(85)
  })

  it('"Cancelar" cierra el formulario sin guardar', () => {
    renderApp(<Inventario />)
    fireEvent.click(screen.getByRole('button', { name: /Nuevo producto/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).toBeNull()
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

  it('guardar cambios actualiza la fila (precio, stock y descuento)', () => {
    renderApp(<Inventario />)
    fireEvent.click(screen.getByLabelText('Editar Cemento Polpaico gris 25 kg'))
    llenar({ 'Precio de venta': '6500', 'Stock': '5', 'Descuento (%)': '10' })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    const fila = screen.getByText('Cemento Polpaico gris 25 kg').closest('tr')
    expect(within(fila).getByText('$6.500')).toBeInTheDocument()
    expect(within(fila).getByText('-10%')).toBeInTheDocument()
    expect(within(fila).getByText('Stock bajo')).toBeInTheDocument() // 5 ≤ stock mínimo (20)
    expect(screen.getByText('Producto "Cemento Polpaico gris 25 kg" actualizado.')).toBeInTheDocument()
  })

  it('al editar, el precio mostrado en el formulario es el normal (sin descuento)', () => {
    renderApp(<Inventario />)
    fireEvent.click(screen.getByLabelText('Editar Ladrillo prensado 6x14x29 cm'))
    expect(screen.getByLabelText('Precio de venta').value).toBe('550')
    expect(screen.getByLabelText('Descuento (%)').value).toBe('10')
  })

  it('un precio inválido no guarda y muestra el error', () => {
    renderApp(<Inventario />)
    fireEvent.click(screen.getByLabelText('Editar Cemento Polpaico gris 25 kg'))
    llenar({ 'Precio de venta': '0' })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(screen.getByText('Ingresa un precio de venta mayor a 0')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('"Eliminar" pide confirmación y al confirmar quita el producto', () => {
    renderApp(<Inventario />)
    fireEvent.click(screen.getByLabelText('Eliminar Cemento Polpaico gris 25 kg'))
    expect(screen.getByText(/¿Seguro que quieres eliminar "Cemento Polpaico gris 25 kg"\?/)).toBeInTheDocument()
    fireEvent.click(within(modal()).getByRole('button', { name: 'Eliminar' }))
    expect(screen.queryByText('Cemento Polpaico gris 25 kg')).toBeNull()
    expect(filas().length).toBe(84)
  })

  it('cancelar la confirmación NO elimina nada', () => {
    renderApp(<Inventario />)
    fireEvent.click(screen.getByLabelText('Eliminar Cemento Polpaico gris 25 kg'))
    fireEvent.click(within(modal()).getByRole('button', { name: 'Cancelar' }))
    expect(screen.getByText('Cemento Polpaico gris 25 kg')).toBeInTheDocument()
    expect(filas().length).toBe(85)
  })

  it('el aviso de éxito se puede cerrar', () => {
    renderApp(<Inventario />)
    fireEvent.click(screen.getByLabelText('Editar Cemento Polpaico gris 25 kg'))
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    fireEvent.click(screen.getByLabelText('Cerrar aviso'))
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('un producto con descuento muestra su insignia en la tabla', () => {
    renderApp(<Inventario />)
    const fila = screen.getByText('Ladrillo prensado 6x14x29 cm').closest('tr')
    expect(within(fila).getByText('-10%')).toBeInTheDocument()
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

  it('valida usuario repetido, correo inválido y contraseña corta', () => {
    renderApp(<Usuarios />)
    fireEvent.click(screen.getByRole('button', { name: /Nuevo usuario/ }))
    llenar({ ...nuevo, 'Usuario': 'admin', 'Correo electrónico': 'x', 'Contraseña': '123' })
    fireEvent.click(screen.getByRole('button', { name: 'Crear usuario' }))
    expect(screen.getByText('Ese nombre de usuario ya está en uso')).toBeInTheDocument()
    expect(screen.getByText('Ingresa un correo válido')).toBeInTheDocument()
    expect(screen.getByText('Mínimo 6 caracteres')).toBeInTheDocument()
    expect(filas().length).toBe(2)
  })

  it('editar: el usuario (login) queda bloqueado y se puede cambiar el rol', () => {
    renderApp(<Usuarios />)
    fireEvent.click(screen.getByLabelText('Editar usuario'))
    expect(screen.getByLabelText('Usuario')).toBeDisabled()
    llenar({ 'Rol': 'admin', 'Nombre completo': 'Cliente Renombrado' })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    const fila = screen.getByText('Cliente Renombrado').closest('tr')
    expect(within(fila).getByText('admin')).toBeInTheDocument()
  })

  it('al editarse a sí mismo no puede cambiar su rol ni su estado', () => {
    renderApp(<Usuarios />)
    fireEvent.click(screen.getByLabelText('Editar admin'))
    expect(screen.getByLabelText('Rol')).toBeDisabled()
    expect(screen.getByLabelText('Estado')).toBeDisabled()
  })

  it('no se puede eliminar la propia cuenta (botón deshabilitado)', () => {
    renderApp(<Usuarios />)
    expect(screen.getByLabelText('Eliminar admin')).toBeDisabled()
    expect(screen.getByLabelText('Eliminar usuario')).not.toBeDisabled()
  })

  it('"Cancelar" en el formulario o en la confirmación no cambia nada', () => {
    renderApp(<Usuarios />)
    fireEvent.click(screen.getByRole('button', { name: /Nuevo usuario/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(screen.getByLabelText('Eliminar usuario'))
    fireEvent.click(within(modal()).getByRole('button', { name: 'Cancelar' }))
    expect(screen.getByText('Cliente Ejemplo')).toBeInTheDocument()
  })

  it('elimina a otro usuario tras confirmar', () => {
    renderApp(<Usuarios />)
    fireEvent.click(screen.getByLabelText('Eliminar usuario'))
    fireEvent.click(within(modal()).getByRole('button', { name: 'Eliminar' }))
    expect(screen.queryByText('Cliente Ejemplo')).toBeNull()
    expect(screen.getByText('Usuario "usuario" eliminado.')).toBeInTheDocument()
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

  it('valida la evaluación fuera de rango y el correo', () => {
    renderApp(<Proveedores />)
    fireEvent.click(screen.getByRole('button', { name: /Nuevo proveedor/ }))
    llenar({ ...nuevo, 'Evaluación (0 a 5)': '9', 'Correo del contacto': 'malo' })
    fireEvent.click(screen.getByRole('button', { name: 'Crear proveedor' }))
    expect(screen.getByText('La evaluación debe estar entre 0 y 5')).toBeInTheDocument()
    expect(screen.getByText('Ingresa un correo válido')).toBeInTheDocument()
    expect(filas().length).toBe(7)
  })

  it('edita un proveedor existente conservando sus demás datos', () => {
    renderApp(<Proveedores />)
    fireEvent.click(screen.getByLabelText('Editar Cementos Polpaico S.A.'))
    expect(screen.getByLabelText('Contacto').value).toBe('Rodrigo Álvarez')
    llenar({ 'Estado': 'pending' })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    const fila = screen.getByText('Cementos Polpaico S.A.').closest('tr')
    expect(within(fila).getByText('Pendiente')).toBeInTheDocument()
  })

  it('"Cancelar" en el formulario o en la confirmación no cambia nada', () => {
    renderApp(<Proveedores />)
    fireEvent.click(screen.getByRole('button', { name: /Nuevo proveedor/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(screen.getByLabelText('Eliminar Cementos Polpaico S.A.'))
    fireEvent.click(within(modal()).getByRole('button', { name: 'Cancelar' }))
    expect(filas().length).toBe(7)
  })

  it('elimina un proveedor tras confirmar', () => {
    renderApp(<Proveedores />)
    fireEvent.click(screen.getByLabelText('Eliminar Cementos Polpaico S.A.'))
    fireEvent.click(within(modal()).getByRole('button', { name: 'Eliminar' }))
    expect(screen.queryByText('Cementos Polpaico S.A.')).toBeNull()
    expect(filas().length).toBe(6)
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
