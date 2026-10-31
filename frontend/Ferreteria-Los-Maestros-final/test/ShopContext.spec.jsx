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
})

describe('ShopContext.placeOrder()', () => {
  it('rechaza la compra si no hay usuario con sesión', () => {
    const { result } = setup()
    let r
    act(() => { r = result.current.placeOrder({ user: null, items: [item()], payment: 'debito', delivery: 'retiro' }) })
    expect(r.ok).toBeFalse()
    expect(r.message).toBe('Debes iniciar sesión para comprar.')
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
})
