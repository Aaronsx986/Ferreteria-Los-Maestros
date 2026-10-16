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
})
