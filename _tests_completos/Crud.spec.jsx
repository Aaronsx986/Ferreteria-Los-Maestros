// PRUEBAS UNITARIAS — CRUD en los contextos (productos, proveedores y usuarios)
import { renderHook, act } from '@testing-library/react'
import { ShopProvider, useShop } from '../src/context/ShopContext.jsx'
import { AuthProvider, useAuth } from '../src/context/AuthContext.jsx'
import { ADMIN, loginAs } from './helpers.jsx'

const setupShop = () => renderHook(() => useShop(), { wrapper: ({ children }) => <ShopProvider>{children}</ShopProvider> })
const setupAuth = () => renderHook(() => useAuth(), { wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider> })

const productoNuevo = {
  code: 'ZZ001', name: 'Producto de prueba', category: 'madera', subcategory: 'Varios', brand: 'Marca',
  unit: 'Unidad', buyPrice: 500, price: 1000, stock: 10, minStock: 2, discount: 0,
}
const proveedorNuevo = {
  name: 'Proveedor Nuevo', contact: { name: 'Pedro', email: 'p@nuevo.cl', phone: '', position: '' },
  paymentTerms: '30 días', deliveryTime: '2 días', rating: 4, status: 'active',
}
const usuarioNuevo = { name: 'Ana Rojas', username: 'arojas', email: 'Ana@Correo.cl', password: 'secreto1', role: 'user', status: 'active' }

describe('ShopContext — ofertas', () => {
  it('"price" es el precio con descuento y "listPrice" el normal', () => {
    const { result } = setupShop()
    const p = result.current.products.find((x) => x.id === 33) // Sierra circular $72.990 con 25 %
    expect(p.listPrice).toBe(72990)
    expect(p.discount).toBe(25)
    expect(p.price).toBe(54743) // 72.990 × 0,75 = 54.742,5 → redondeado
  })

  it('un producto sin descuento mantiene su precio', () => {
    const { result } = setupShop()
    const p = result.current.products.find((x) => x.id === 1)
    expect(p.discount).toBe(0)
    expect(p.price).toBe(p.listPrice)
  })
})

describe('ShopContext — CRUD de productos', () => {
  it('addProduct: asigna el siguiente id, la etiqueta de categoría y lo persiste', () => {
    const { result } = setupShop()
    let creado
    act(() => { creado = result.current.addProduct(productoNuevo) })
    expect(creado.id).toBe(86)
    expect(result.current.products.length).toBe(86)
    expect(result.current.products.find((p) => p.id === 86).categoryLabel).toBe('Madera')
    expect(JSON.parse(localStorage.getItem('flm_catalog')).length).toBe(86)
  })

  it('updateProduct: cambia solo los campos enviados', () => {
    const { result } = setupShop()
    act(() => { result.current.updateProduct(1, { name: 'Cemento editado', discount: 20 }) })
    const p = result.current.products.find((x) => x.id === 1)
    expect(p.name).toBe('Cemento editado')
    expect(p.brand).toBe('Polpaico')
    expect(p.price).toBe(4792) // 5.990 − 20 %
  })

  it('updateProduct: si cambia la categoría, actualiza también su etiqueta', () => {
    const { result } = setupShop()
    act(() => { result.current.updateProduct(1, { category: 'jardin' }) })
    expect(result.current.products.find((x) => x.id === 1).categoryLabel).toBe('Jardín')
  })

  it('updateProduct: corregir el stock lo deja vigente (flm_stock)', () => {
    const { result } = setupShop()
    act(() => { result.current.updateProduct(1, { stock: 5 }) })
    expect(result.current.products.find((x) => x.id === 1).stock).toBe(5)
    expect(JSON.parse(localStorage.getItem('flm_stock'))['1']).toBe(5)
  })

  it('deleteProduct: lo quita del catálogo y de los stocks guardados', () => {
    localStorage.setItem('flm_stock', JSON.stringify({ 1: 7, 2: 9 }))
    const { result } = setupShop()
    act(() => { result.current.deleteProduct(1) })
    expect(result.current.products.find((x) => x.id === 1)).toBeUndefined()
    expect(result.current.products.length).toBe(84)
    expect(JSON.parse(localStorage.getItem('flm_stock'))).toEqual({ 2: 9 })
  })

  it('los cambios sobreviven a una recarga (se leen de localStorage)', () => {
    const primera = setupShop()
    act(() => { primera.result.current.addProduct(productoNuevo) })
    primera.unmount()
    const segunda = setupShop()
    expect(segunda.result.current.products.some((p) => p.code === 'ZZ001')).toBeTrue()
  })

  it('placeOrder guarda los datos de envío en la orden', () => {
    const { result } = setupShop()
    const shipping = { nombre: 'Ana', calle: 'Los Alerces 123' }
    let r
    act(() => {
      r = result.current.placeOrder({
        user: { username: 'u', name: 'Ana' },
        items: [{ id: 1, code: 'MC001', name: 'Cemento', price: 5990, qty: 1, imagen: '' }],
        payment: 'debito', delivery: 'despacho', shipping,
      })
    })
    expect(r.order.shipping).toEqual(shipping)
  })

  it('placeOrder cobra el precio con descuento', () => {
    const { result } = setupShop()
    const p = result.current.products.find((x) => x.id === 57) // Disyuntor $6.990 − 30 %
    let r
    act(() => {
      r = result.current.placeOrder({
        user: { username: 'u', name: 'Ana' },
        items: [{ ...p, qty: 2 }], payment: 'efectivo', delivery: 'retiro',
      })
    })
    expect(r.order.total).toBe(4893 * 2)
  })
})

describe('ShopContext — CRUD de proveedores', () => {
  it('addSupplier: asigna id 8 (hay 7), estado y fecha de alta', () => {
    const { result } = setupShop()
    let creado
    act(() => { creado = result.current.addSupplier(proveedorNuevo) })
    expect(creado.id).toBe(8)
    expect(result.current.suppliers.length).toBe(8)
    expect(creado.since).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('updateSupplier: modifica el proveedor indicado', () => {
    const { result } = setupShop()
    act(() => { result.current.updateSupplier(1, { rating: 3.2, status: 'pending' }) })
    const s = result.current.suppliers.find((x) => x.id === 1)
    expect(s.rating).toBe(3.2)
    expect(s.status).toBe('pending')
    expect(s.name).toBe('Cementos Polpaico S.A.')
  })

  it('deleteSupplier: lo elimina y persiste el cambio', () => {
    const { result } = setupShop()
    act(() => { result.current.deleteSupplier(1) })
    expect(result.current.suppliers.length).toBe(6)
    expect(JSON.parse(localStorage.getItem('flm_suppliers')).length).toBe(6)
  })
})

describe('AuthContext — CRUD de usuarios', () => {
  it('addUser: crea el usuario con el rol indicado y el correo en minúsculas', () => {
    const { result } = setupAuth()
    let r
    act(() => { r = result.current.addUser({ ...usuarioNuevo, role: 'admin' }) })
    expect(r.ok).toBeTrue()
    const u = result.current.users.find((x) => x.username === 'arojas')
    expect(u.role).toBe('admin')
    expect(u.email).toBe('ana@correo.cl')
  })

  it('addUser: rechaza usuario o correo repetidos', () => {
    const { result } = setupAuth()
    let a, b
    act(() => { a = result.current.addUser({ ...usuarioNuevo, username: 'ADMIN' }) })
    act(() => { b = result.current.addUser({ ...usuarioNuevo, email: 'usuario@ferreterialosmaestros.cl' }) })
    expect(a.ok).toBeFalse()
    expect(b.ok).toBeFalse()
    expect(result.current.users.length).toBe(2)
  })

  it('un usuario creado desde el panel puede iniciar sesión', () => {
    const { result } = setupAuth()
    act(() => { result.current.addUser(usuarioNuevo) })
    let r
    act(() => { r = result.current.login('arojas', 'secreto1') })
    expect(r.ok).toBeTrue()
  })

  it('updateUser: edita un usuario del JSON y persiste el cambio', () => {
    const { result } = setupAuth()
    act(() => { result.current.updateUser('usuario', { name: 'Nombre nuevo', role: 'admin' }) })
    const u = result.current.users.find((x) => x.username === 'usuario')
    expect(u.name).toBe('Nombre nuevo')
    expect(u.role).toBe('admin')
    expect(JSON.parse(localStorage.getItem('flm_user_changes')).edits.usuario.name).toBe('Nombre nuevo')
  })

  it('updateUser: una contraseña vacía no reemplaza la anterior; una nueva sí', () => {
    const { result } = setupAuth()
    act(() => { result.current.updateUser('usuario', { password: '' }) })
    let r1, r2
    act(() => { r1 = result.current.login('usuario', 'user123') })
    expect(r1.ok).toBeTrue()
    act(() => { result.current.logout() })
    act(() => { result.current.updateUser('usuario', { password: 'nueva123' }) })
    act(() => { r2 = result.current.login('usuario', 'nueva123') })
    expect(r2.ok).toBeTrue()
  })

  it('updateUser: un usuario inactivo no puede iniciar sesión', () => {
    const { result } = setupAuth()
    act(() => { result.current.updateUser('usuario', { status: 'inactive' }) })
    let r
    act(() => { r = result.current.login('usuario', 'user123') })
    expect(r.ok).toBeFalse()
    expect(r.message).toBe('Tu cuenta está inactiva')
  })

  it('updateUser: no permite repetir el correo de otro usuario', () => {
    const { result } = setupAuth()
    let r
    act(() => { r = result.current.updateUser('usuario', { email: 'admin@ferreterialosmaestros.cl' }) })
    expect(r.ok).toBeFalse()
  })

  it('updateUser: el administrador logueado no puede quitarse el rol ni desactivarse', () => {
    loginAs(ADMIN)
    const { result } = setupAuth()
    let a, b
    act(() => { a = result.current.updateUser('admin', { role: 'user' }) })
    act(() => { b = result.current.updateUser('admin', { status: 'inactive' }) })
    expect(a.ok).toBeFalse()
    expect(b.ok).toBeFalse()
    expect(result.current.users.find((u) => u.username === 'admin').role).toBe('admin')
  })

  it('updateUser: si el admin edita su propio nombre, la sesión se actualiza', () => {
    loginAs(ADMIN)
    const { result } = setupAuth()
    act(() => { result.current.updateUser('admin', { name: 'Admin Renombrado' }) })
    expect(result.current.user.name).toBe('Admin Renombrado')
    expect(JSON.parse(localStorage.getItem('currentUser')).name).toBe('Admin Renombrado')
  })

  it('updateUser: un usuario que no existe devuelve error', () => {
    const { result } = setupAuth()
    let r
    act(() => { r = result.current.updateUser('fantasma', { name: 'x' }) })
    expect(r.ok).toBeFalse()
  })

  it('deleteUser: un usuario del JSON se marca como eliminado y ya no inicia sesión', () => {
    const { result } = setupAuth()
    act(() => { result.current.deleteUser('usuario') })
    expect(result.current.users.map((u) => u.username)).toEqual(['admin'])
    let r
    act(() => { r = result.current.login('usuario', 'user123') })
    expect(r.ok).toBeFalse()
  })

  it('deleteUser: un usuario creado desde la app se borra de verdad', () => {
    const { result } = setupAuth()
    act(() => { result.current.addUser(usuarioNuevo) })
    act(() => { result.current.deleteUser('arojas') })
    expect(result.current.users.length).toBe(2)
    expect(JSON.parse(localStorage.getItem('flm_users'))).toEqual([])
  })

  it('deleteUser: nadie puede eliminar su propia cuenta', () => {
    loginAs(ADMIN)
    const { result } = setupAuth()
    let r
    act(() => { r = result.current.deleteUser('admin') })
    expect(r.ok).toBeFalse()
    expect(result.current.users.length).toBe(2)
  })

  it('los cambios sobreviven a una recarga', () => {
    const primera = setupAuth()
    act(() => { primera.result.current.deleteUser('usuario') })
    primera.unmount()
    const segunda = setupAuth()
    expect(segunda.result.current.users.map((u) => u.username)).toEqual(['admin'])
  })
})
