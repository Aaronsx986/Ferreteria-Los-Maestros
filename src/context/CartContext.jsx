import { createContext, useContext, useState, useEffect } from 'react'
import { useShop } from './ShopContext.jsx'
import { load, save } from '../utils.js'

const CartContext = createContext(null)
const CART_KEY = 'flm_cart'

export function CartProvider({ children }) {
  const { products } = useShop()
  const [items, setItems] = useState(() => load(CART_KEY, []))

  // Persiste el carrito, así sobrevive a un refresh
  useEffect(() => save(CART_KEY, items), [items])

  const stockOf = (id) => products.find((p) => p.id === id)?.stock ?? 0

  // Agrega respetando el stock disponible. Devuelve true si se agregó algo.
  function addToCart(productId, qty = 1) {
    const max = stockOf(productId)
    const inCart = items.find((it) => it.id === productId)?.qty || 0
    if (max <= 0 || inCart >= max) return false
    const toAdd = Math.min(qty, max - inCart)
    setItems((prev) => {
      const existing = prev.find((it) => it.id === productId)
      if (existing) {
        return prev.map((it) => (it.id === productId ? { ...it, qty: it.qty + toAdd } : it))
      }
      return [...prev, { id: productId, qty: toAdd }]
    })
    return true
  }

  function updateQty(productId, qty) {
    const max = stockOf(productId)
    const safe = Math.min(Math.max(0, Math.floor(qty) || 0), max)
    setItems((prev) =>
      prev
        .map((it) => (it.id === productId ? { ...it, qty: safe } : it))
        .filter((it) => it.qty > 0)
    )
  }

  function removeFromCart(productId) {
    setItems((prev) => prev.filter((it) => it.id !== productId))
  }

  function clearCart() {
    setItems([])
  }

  const qtyInCart = (productId) => items.find((it) => it.id === productId)?.qty || 0

  // El carrito solo guarda {id, qty}; acá se cruza con el catálogo vigente
  const detailedItems = items
    .map((it) => {
      const product = products.find((p) => p.id === it.id)
      return product ? { ...product, qty: it.qty } : null
    })
    .filter(Boolean)

  const count = detailedItems.reduce((sum, it) => sum + it.qty, 0)
  const total = detailedItems.reduce((sum, it) => sum + it.price * it.qty, 0)

  return (
    <CartContext.Provider
      value={{ items: detailedItems, count, total, addToCart, updateQty, removeFromCart, clearCart, qtyInCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
