import { createContext, useContext, useState, useEffect } from 'react'
import productsData from '../data/products.json'

const CartContext = createContext(null)
const CART_KEY = 'flm_cart'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || []
    } catch {
      return []
    }
  })

  // Persiste el carrito cada vez que cambia, así sobrevive a un refresh
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  function addToCart(productId, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((it) => it.id === productId)
      if (existing) {
        return prev.map((it) =>
          it.id === productId ? { ...it, qty: it.qty + qty } : it
        )
      }
      return [...prev, { id: productId, qty }]
    })
  }

  function updateQty(productId, qty) {
    setItems((prev) =>
      prev
        .map((it) => (it.id === productId ? { ...it, qty } : it))
        .filter((it) => it.qty > 0)
    )
  }

  function removeFromCart(productId) {
    setItems((prev) => prev.filter((it) => it.id !== productId))
  }

  function clearCart() {
    setItems([])
  }

  // El carrito solo guarda {id, qty}; acá se cruza con products.json
  // para tener nombre, precio, etc. a la hora de mostrarlo
  const detailedItems = items
    .map((it) => {
      const product = productsData.products.find((p) => p.id === it.id)
      return product ? { ...product, qty: it.qty } : null
    })
    .filter(Boolean)

  const count = items.reduce((sum, it) => sum + it.qty, 0)
  const total = detailedItems.reduce((sum, it) => sum + it.price * it.qty, 0)

  return (
    <CartContext.Provider
      value={{ items: detailedItems, count, total, addToCart, updateQty, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
