// PRUEBAS UNITARIAS — ShopContext (catálogo con stock vigente, compras, arriendos, servicios)
import { renderHook, act } from '@testing-library/react'
import { ShopProvider, useShop } from '../src/context/ShopContext.jsx'
import { CLIENTE, setStock } from './helpers.jsx'

const wrapper = ({ children }) => <ShopProvider>{children}</ShopProvider>
const setup = () => renderHook(() => useShop(), { wrapper })
const item = (over = {}) => ({ id: 1, code: 'MC001', name: 'Cemento Polpaico gris 25 kg', price: 5990, qty: 2, imagen: '/img/x.jpg', ...over })

describe('ShopContext — catálogo', () => {
  it('carga los 85 productos de products.json', () => {
    const { result } = setup()
    expect(result.current.products.length).toBe(85)
  })

  it('usa el stock base del JSON si no hay stock modificado', () => {
    const { result } = setup()
    expect(result.current.products.find((p) => p.id === 1).stock).toBe(80)
  })

  it('aplica el stock guardado (flm_stock) por sobre el del JSON', () => {
    setStock({ 1: 7 })
    const { result } = setup()
    expect(result.current.products.find((p) => p.id === 1).stock).toBe(7)
  })
})

describe('ShopContext.placeOrder()', () => {
  it('rechaza la compra si no hay usuario con sesión', () => {
    const { result } = setup()
    let r
    act(() => { r = result.current.placeOrder({ user: null, items: [item()], payment: 'debito', delivery: 'retiro' }) })
    expect(r.ok).toBeFalse()
    expect(r.message).toBe('Debes iniciar sesión para comprar.')
  })

  it('rechaza un carrito vacío', () => {
    const { result } = setup()
    let r
    act(() => { r = result.current.placeOrder({ user: CLIENTE, items: [], payment: 'debito', delivery: 'retiro' }) })
    expect(r.ok).toBeFalse()
    expect(r.message).toBe('Tu carrito está vacío.')
  })

  it('rechaza si no hay stock suficiente y NO descuenta nada', () => {
    setStock({ 1: 1 })
    const { result } = setup()
    let r
    act(() => { r = result.current.placeOrder({ user: CLIENTE, items: [item({ qty: 3 })], payment: 'debito', delivery: 'retiro' }) })
    expect(r.ok).toBeFalse()
    expect(r.message).toContain('No hay stock suficiente')
    expect(result.current.products.find((p) => p.id === 1).stock).toBe(1)
    expect(result.current.orders.length).toBe(0)
  })

  it('compra válida: crea la orden C-1001, calcula el total y descuenta stock', () => {
    setStock({ 1: 5 })
    const { result } = setup()
    let r
    act(() => { r = result.current.placeOrder({ user: CLIENTE, items: [item({ qty: 2 })], payment: 'debito', delivery: 'retiro' }) })
    expect(r.ok).toBeTrue()
    expect(r.order.id).toBe('C-1001')
    expect(r.order.total).toBe(11980)
    expect(r.order.username).toBe('usuario')
    expect(result.current.products.find((p) => p.id === 1).stock).toBe(3)
    expect(result.current.orders.length).toBe(1)
  })

  it('los IDs de compra son correlativos (C-1001, C-1002)', () => {
    const { result } = setup()
    act(() => { result.current.placeOrder({ user: CLIENTE, items: [item({ qty: 1 })], payment: 'efectivo', delivery: 'retiro' }) })
    let r2
    act(() => { r2 = result.current.placeOrder({ user: CLIENTE, items: [item({ qty: 1 })], payment: 'efectivo', delivery: 'retiro' }) })
    expect(r2.order.id).toBe('C-1002')
  })

  it('el estado de la orden depende del tipo de entrega', () => {
    const { result } = setup()
    let a, b
    act(() => { a = result.current.placeOrder({ user: CLIENTE, items: [item({ qty: 1 })], payment: 'debito', delivery: 'despacho' }) })
    act(() => { b = result.current.placeOrder({ user: CLIENTE, items: [item({ qty: 1 })], payment: 'debito', delivery: 'retiro' }) })
    expect(a.order.estado).toBe('En preparación')
    expect(b.order.estado).toBe('Listo para retiro')
  })

  it('persiste órdenes y stock en localStorage', () => {
    const { result } = setup()
    act(() => { result.current.placeOrder({ user: CLIENTE, items: [item({ qty: 4 })], payment: 'debito', delivery: 'retiro' }) })
    expect(JSON.parse(localStorage.getItem('flm_orders')).length).toBe(1)
    expect(JSON.parse(localStorage.getItem('flm_stock'))['1']).toBe(76)
  })
})

describe('ShopContext — arriendos y servicio técnico', () => {
  it('addRental crea el arriendo A-201 con estado "Solicitado"', () => {
    const { result } = setup()
    let rental
    act(() => {
      rental = result.current.addRental({
        user: CLIENTE, tool: { id: 20, name: 'Martillo carpintero 500g' },
        inicio: '2099-01-01', termino: '2099-01-03', dias: 3, pago: 'efectivo',
        deposito: 15980, costo: 23970, comentarios: '',
      })
    })
    expect(rental.id).toBe('A-201')
    expect(rental.estado).toBe('Solicitado')
    expect(result.current.rentals.length).toBe(1)
  })

  it('addService crea el servicio S-301 con el nombre armado', () => {
    const { result } = setup()
    let s
    act(() => {
      s = result.current.addService({
        user: CLIENTE, tipo: 'Taladro', marca: 'Makita', urgencia: 'alta',
        fecha: '2099-05-01', hora: '10:30', descripcion: 'No enciende',
      })
    })
    expect(s.id).toBe('S-301')
    expect(s.servicio).toBe('Reparación Taladro (Makita)')
    expect(s.agendado).toBe('2099-05-01 10:30')
  })

  it('addService sin marca no agrega paréntesis', () => {
    const { result } = setup()
    let s
    act(() => { s = result.current.addService({ user: CLIENTE, tipo: 'Sierra', marca: '', urgencia: 'normal', fecha: '2099-05-01', hora: '09:00', descripcion: 'x' }) })
    expect(s.servicio).toBe('Reparación Sierra')
  })
})
