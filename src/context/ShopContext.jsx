import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import productsData from '../data/products.json'
import { load, save } from '../utils.js'

const ShopContext = createContext(null)

const KEYS = {
  stock: 'flm_stock',       // { [productId]: stockActual }
  orders: 'flm_orders',     // compras realizadas
  rentals: 'flm_rentals',   // solicitudes de arriendo
  services: 'flm_services', // solicitudes de servicio técnico
}

// Genera un ID correlativo: C-1001, C-1002...
function nextId(prefix, start, list) {
  const max = list.reduce((m, it) => {
    const n = parseInt(String(it.id).split('-')[1], 10)
    return isNaN(n) ? m : Math.max(m, n)
  }, start - 1)
  return `${prefix}-${max + 1}`
}

export function ShopProvider({ children }) {
  const [stockOverrides, setStockOverrides] = useState(() => load(KEYS.stock, {}))
  const [orders, setOrders] = useState(() => load(KEYS.orders, []))
  const [rentals, setRentals] = useState(() => load(KEYS.rentals, []))
  const [services, setServices] = useState(() => load(KEYS.services, []))

  useEffect(() => save(KEYS.stock, stockOverrides), [stockOverrides])
  useEffect(() => save(KEYS.orders, orders), [orders])
  useEffect(() => save(KEYS.rentals, rentals), [rentals])
  useEffect(() => save(KEYS.services, services), [services])

  // Catálogo con el stock vigente (el base del JSON menos lo ya vendido)
  const products = useMemo(
    () =>
      productsData.products.map((p) => ({
        ...p,
        stock: stockOverrides[p.id] ?? p.stock,
      })),
    [stockOverrides]
  )

  // Registra una compra, descuenta stock y devuelve { ok, order } o { ok:false, message }
  function placeOrder({ user, items, payment, delivery }) {
    if (!user) return { ok: false, message: 'Debes iniciar sesión para comprar.' }
    if (!items.length) return { ok: false, message: 'Tu carrito está vacío.' }

    // Se valida contra el stock real al momento de pagar
    for (const it of items) {
      const current = products.find((p) => p.id === it.id)
      if (!current || current.stock < it.qty) {
        return {
          ok: false,
          message: `No hay stock suficiente de "${it.name}" (disponible: ${current ? current.stock : 0}).`,
        }
      }
    }

    const order = {
      id: nextId('C', 1001, orders),
      username: user.username,
      customer: user.name || user.username,
      fecha: new Date().toISOString(),
      items: items.map((it) => ({
        id: it.id,
        code: it.code,
        name: it.name,
        price: it.price,
        qty: it.qty,
        imagen: it.imagen,
      })),
      total: items.reduce((s, it) => s + it.price * it.qty, 0),
      payment,
      delivery,
      estado: delivery === 'despacho' ? 'En preparación' : 'Listo para retiro',
    }

    setStockOverrides((prev) => {
      const next = { ...prev }
      items.forEach((it) => {
        const base = productsData.products.find((p) => p.id === it.id)
        next[it.id] = (prev[it.id] ?? base.stock) - it.qty
      })
      return next
    })
    setOrders((prev) => [order, ...prev])
    return { ok: true, order }
  }

  function addRental({ user, tool, inicio, termino, dias, pago, deposito, costo, comentarios }) {
    const rental = {
      id: nextId('A', 201, rentals),
      username: user.username,
      customer: user.name || user.username,
      herramienta: tool.name,
      toolId: tool.id,
      inicio,
      termino,
      dias,
      pago,
      deposito,
      costo,
      comentarios,
      creado: new Date().toISOString(),
      estado: 'Solicitado',
    }
    setRentals((prev) => [rental, ...prev])
    return rental
  }

  function addService({ user, tipo, marca, urgencia, fecha, hora, descripcion }) {
    const service = {
      id: nextId('S', 301, services),
      username: user.username,
      customer: user.name || user.username,
      servicio: `Reparación ${tipo}${marca ? ` (${marca})` : ''}`,
      urgencia,
      descripcion,
      solicitado: new Date().toISOString(),
      agendado: `${fecha} ${hora}`,
      completado: null,
      estado: 'Solicitado',
    }
    setServices((prev) => [service, ...prev])
    return service
  }

  return (
    <ShopContext.Provider
      value={{ products, orders, rentals, services, placeOrder, addRental, addService }}
    >
      {children}
    </ShopContext.Provider>
  )
}

export function useShop() {
  return useContext(ShopContext)
}
