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

  it('addToCart agrega el producto y devuelve true', () => {
    const { result } = setup()
    let ok
    act(() => { ok = result.current.addToCart(1) })
    expect(ok).toBeTrue()
    expect(result.current.count).toBe(1)
    expect(result.current.items[0].name).toBe('Cemento Polpaico gris 25 kg')
  })

  it('agregar el mismo producto dos veces suma la cantidad (no duplica la fila)', () => {
    const { result } = setup()
    act(() => { result.current.addToCart(1) })
    act(() => { result.current.addToCart(1, 2) })
    expect(result.current.items.length).toBe(1)
    expect(result.current.items[0].qty).toBe(3)
  })

  it('NO permite superar el stock disponible', () => {
    setStock({ 1: 2 })
    const { result } = setup()
    act(() => { result.current.addToCart(1, 5) })
    expect(result.current.items[0].qty).toBe(2) // recortado al stock
    let ok
    act(() => { ok = result.current.addToCart(1) })
    expect(ok).toBeFalse()
    expect(result.current.items[0].qty).toBe(2)
  })

  it('no agrega un producto sin stock', () => {
    setStock({ 1: 0 })
    const { result } = setup()
    let ok
    act(() => { ok = result.current.addToCart(1) })
    expect(ok).toBeFalse()
    expect(result.current.items.length).toBe(0)
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

  it('updateQty cambia la cantidad', () => {
    const { result } = setup()
    act(() => { result.current.addToCart(1, 1) })
    act(() => { result.current.updateQty(1, 4) })
    expect(result.current.qtyInCart(1)).toBe(4)
  })

  it('updateQty a 0 elimina el producto del carrito', () => {
    const { result } = setup()
    act(() => { result.current.addToCart(1, 2) })
    act(() => { result.current.updateQty(1, 0) })
    expect(result.current.items.length).toBe(0)
  })

  it('updateQty recorta cantidades mayores al stock y descarta negativos', () => {
    setStock({ 1: 3 })
    const { result } = setup()
    act(() => { result.current.addToCart(1, 1) })
    act(() => { result.current.updateQty(1, 99) })
    expect(result.current.qtyInCart(1)).toBe(3)
    act(() => { result.current.updateQty(1, -5) })
    expect(result.current.items.length).toBe(0)
  })

  it('removeFromCart quita solo el producto indicado', () => {
    const { result } = setup()
    act(() => { result.current.addToCart(1) })
    act(() => { result.current.addToCart(2) })
    act(() => { result.current.removeFromCart(1) })
    expect(result.current.items.map((i) => i.id)).toEqual([2])
  })

  it('clearCart vacía todo', () => {
    const { result } = setup()
    act(() => { result.current.addToCart(1, 2) })
    act(() => { result.current.clearCart() })
    expect(result.current.count).toBe(0)
  })

  it('qtyInCart devuelve 0 para un producto que no está', () => {
    const { result } = setup()
    expect(result.current.qtyInCart(999)).toBe(0)
  })
})

describe('CartContext — persistencia', () => {
  it('guarda el carrito en localStorage (solo id y qty)', () => {
    const { result } = setup()
    act(() => { result.current.addToCart(1, 2) })
    expect(JSON.parse(localStorage.getItem('flm_cart'))).toEqual([{ id: 1, qty: 2 }])
  })

  it('recupera el carrito guardado al recargar la página', () => {
    localStorage.setItem('flm_cart', JSON.stringify([{ id: 2, qty: 3 }]))
    const { result } = setup()
    expect(result.current.count).toBe(3)
  })

  it('ignora productos del carrito que ya no existen en el catálogo', () => {
    localStorage.setItem('flm_cart', JSON.stringify([{ id: 99999, qty: 1 }]))
    const { result } = setup()
    expect(result.current.items).toEqual([])
  })
})
