import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import productsData from '../data/products.json'
import suppliersData from '../data/suppliers.json'
import { categoryLabel } from '../data/categories.js'
import { load, save } from '../utils.js'

const ShopContext = createContext(null)

const KEYS = {
  catalog: 'flm_catalog',   // catálogo completo (el JSON es solo la semilla inicial)
  suppliers: 'flm_suppliers', // proveedores (semilla: suppliers.json)
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

// Aplica el descuento: "price" pasa a ser el precio vigente y "listPrice" el precio normal
function withOffer(p) {
  const discount = Number(p.discount) || 0
  return { ...p, discount, listPrice: p.price, price: Math.round(p.price * (1 - discount / 100)) }
}

// Siguiente id numérico (productos y proveedores)
const nextNumericId = (list) => list.reduce((m, it) => Math.max(m, it.id), 0) + 1

export function ShopProvider({ children }) {
  const [catalog, setCatalog] = useState(() => load(KEYS.catalog, productsData.products))
  const [suppliers, setSuppliers] = useState(() => load(KEYS.suppliers, suppliersData.suppliers))
  const [stockOverrides, setStockOverrides] = useState(() => load(KEYS.stock, {}))
  const [orders, setOrders] = useState(() => load(KEYS.orders, []))
  const [rentals, setRentals] = useState(() => load(KEYS.rentals, []))
  const [services, setServices] = useState(() => load(KEYS.services, []))

  useEffect(() => save(KEYS.catalog, catalog), [catalog])
  useEffect(() => save(KEYS.suppliers, suppliers), [suppliers])
  useEffect(() => save(KEYS.stock, stockOverrides), [stockOverrides])
  useEffect(() => save(KEYS.orders, orders), [orders])
  useEffect(() => save(KEYS.rentals, rentals), [rentals])
  useEffect(() => save(KEYS.services, services), [services])

  // Catálogo con el stock vigente (el base del JSON menos lo ya vendido)
  const products = useMemo(
    () => catalog.map((p) => withOffer({ ...p, stock: stockOverrides[p.id] ?? p.stock })),
    [catalog, stockOverrides]
  )

  // ===== CRUD de productos (panel de administración) =====
  function addProduct(data) {
    const product = {
      icon: 'bi-box-seam',
      imagen: '',
      discount: 0,
      ...data,
      id: nextNumericId(catalog),
      categoryLabel: categoryLabel(data.category),
    }
    setCatalog((prev) => [...prev, product])
    return product
  }

  function updateProduct(id, changes) {
    const patch = { ...changes }
    if (changes.category) patch.categoryLabel = categoryLabel(changes.category)
    setCatalog((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
    // El stock vigente vive en stockOverrides: si el admin lo corrige, se actualiza ahí también
    if (changes.stock !== undefined) {
      setStockOverrides((prev) => ({ ...prev, [id]: changes.stock }))
    }
  }

  function deleteProduct(id) {
    setCatalog((prev) => prev.filter((p) => p.id !== id))
    setStockOverrides((prev) => {
      const { [id]: _removed, ...rest } = prev
      return rest
    })
  }

  // ===== CRUD de proveedores =====
  function addSupplier(data) {
    const supplier = { status: 'active', ...data, id: nextNumericId(suppliers), since: new Date().toISOString().slice(0, 10) }
    setSuppliers((prev) => [...prev, supplier])
    return supplier
  }

  function updateSupplier(id, changes) {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...changes } : s)))
  }

  function deleteSupplier(id) {
    setSuppliers((prev) => prev.filter((s) => s.id !== id))
  }

  // Registra una compra, descuenta stock y devuelve { ok, order } o { ok:false, message }
  function placeOrder({ user, items, payment, delivery, shipping = null }) {
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
      shipping, // datos del cliente y dirección ingresados en el checkout
      estado: delivery === 'despacho' ? 'En preparación' : 'Listo para retiro',
    }

    setStockOverrides((prev) => {
      const next = { ...prev }
      items.forEach((it) => {
        const base = catalog.find((p) => p.id === it.id)
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
      value={{
        products, suppliers, orders, rentals, services,
        addProduct, updateProduct, deleteProduct,
        addSupplier, updateSupplier, deleteSupplier,
        placeOrder, addRental, addService,
      }}
    >
      {children}
    </ShopContext.Provider>
  )
}

export function useShop() {
  return useContext(ShopContext)
}
