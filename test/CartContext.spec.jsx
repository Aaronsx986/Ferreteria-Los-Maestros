// PRUEBAS UNITARIAS — CartContext (estado del carrito: agregar, cantidades, totales, persistencia)
import { renderHook, act } from '@testing-library/react'
import { ShopProvider } from '../src/context/ShopContext.jsx'
import { CartProvider, useCart } from '../src/context/CartContext.jsx'
import { setStock } from './helpers.jsx'

const wrapper = ({ children }) => (
  <ShopProvider><CartProvider>{children}</CartProvider></ShopProvider>
)
const setup = () => renderHook(() => useCart(), { wrapper })

describe('CartContext — agregar productos', () => {
  it('el carrito parte vacío', () => {
    const { result } = setup()
    expect(result.current.items).toEqual([])
    expect(result.current.count).toBe(0)
    expect(result.current.total).toBe(0)
  })
})

describe('CartContext — cantidades y totales', () => {
  it('calcula count y total (precio × cantidad)', () => {
    const { result } = setup()
    act(() => { result.current.addToCart(1, 2) }) // 5.990 × 2
    act(() => { result.current.addToCart(2, 1) }) // 7.490 × 1
    expect(result.current.count).toBe(3)
    expect(result.current.total).toBe(5990 * 2 + 7490)
  })
})

describe('CartContext — persistencia', () => {
  it('guarda el carrito en localStorage (solo id y qty)', () => {
    const { result } = setup()
    act(() => { result.current.addToCart(1, 2) })
    expect(JSON.parse(localStorage.getItem('flm_cart'))).toEqual([{ id: 1, qty: 2 }])
  })
})
