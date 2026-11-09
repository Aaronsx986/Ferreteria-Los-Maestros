import { createContext, useContext, useEffect, useState } from 'react'
import suppliersData from '../data/suppliers.json'
import { categoryLabel, normalizeCategory } from '../data/categories.js'
import { load, save } from '../utils.js'
import { API_URL } from '../config.js'
import { authHeaders } from '../services/api.js'

const ShopContext = createContext(null)

const KEYS = {
  suppliers: 'flm_suppliers',
  orders: 'flm_orders',
  rentals: 'flm_rentals',
  services: 'flm_services',
}

// Genera un ID correlativo: C-1001, C-1002...
function nextId(prefix, start, list) {
  const max = list.reduce((m, it) => {
    const n = parseInt(String(it.id).split('-')[1], 10)
    return isNaN(n) ? m : Math.max(m, n)
  }, start - 1)
  return `${prefix}-${max + 1}`
}

// Siguiente id numérico (proveedores)
const nextNumericId = (list) => list.reduce((m, it) => Math.max(m, it.id), 0) + 1

export function ShopProvider({ children }) {
  // 1. PRODUCTOS (Desde Spring Boot)
  const [catalog, setCatalog] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  // 2. OTROS ESTADOS (Mantenemos LocalStorage por ahora)
  const [suppliers, setSuppliers] = useState(() => load(KEYS.suppliers, suppliersData.suppliers))
  const [orders, setOrders] = useState(() => load(KEYS.orders, []))
  const [rentals, setRentals] = useState(() => load(KEYS.rentals, []))
  const [services, setServices] = useState(() => load(KEYS.services, []))

  useEffect(() => save(KEYS.suppliers, suppliers), [suppliers])
  useEffect(() => save(KEYS.orders, orders), [orders])
  useEffect(() => save(KEYS.rentals, rentals), [rentals])
  useEffect(() => save(KEYS.services, services), [services])

  // 3. CONEXIÓN A POSTGRESQL (GET)
  useEffect(() => {
    fetch(`${API_URL}/api/productos`)
      .then((res) => res.json())
      .then((data) => {
        const productosBackend = data.map((dbItem) => ({
          id: dbItem.idCodigo,
          code: dbItem.idCodigo,
          name: dbItem.nombreProducto,
          category: normalizeCategory(dbItem.categoria),
          categoryLabel: categoryLabel(normalizeCategory(dbItem.categoria)) || dbItem.categoria,
          subcategory: dbItem.subcategoria,
          brand: dbItem.marca,
          price: dbItem.pVentaClp,
          listPrice: dbItem.pVentaClp,
          discount: 0,
          stock: dbItem.stock,
          icon: 'bi-box-seam',
          imagen: dbItem.imagenUrl || '',
        }))
        setCatalog(productosBackend)
        setLoadingProducts(false)
      })
      .catch((error) => {
        console.error("Error conectando con Spring Boot:", error)
        setLoadingProducts(false)
      })
  }, [])

  const products = catalog

  // ===== CRUD PRODUCTOS (Spring Boot) =====
  async function addProduct(data) {
    const newProduct = {
      idCodigo: data.code,
      categoria: data.category,
      subcategoria: data.subcategory,
      nombreProducto: data.name,
      marca: data.brand,
      unidad: data.unidad || 'UN',
      pCompraClp: Number(data.price) * 0.5, // Simulado por ahora
      pVentaClp: Number(data.price),
      stock: Number(data.stock),
      stockMinimo: Number(data.stock) * 0.2, // Simulado por ahora
      imagenUrl: data.imagen || '' 
    }

    try {
      const response = await fetch(`${API_URL}/api/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(newProduct)
      })
      if (response.ok) {
        const savedDBProduct = await response.json()
        const mappedProduct = {
          ...data,
          id: savedDBProduct.idCodigo,
          code: savedDBProduct.idCodigo,
          categoryLabel: categoryLabel(savedDBProduct.categoria),
        }
        setCatalog((prev) => [...prev, mappedProduct])
        return mappedProduct
      }
    } catch (error) {
      console.error("Error guardando producto:", error)
    }
  }

  async function updateProduct(id, changes) {
    const existing = catalog.find(p => p.id === id)
    if (!existing) return
    
    const updated = { ...existing, ...changes }
    const dbFormat = {
      idCodigo: updated.code,
      categoria: updated.category,
      subcategoria: updated.subcategory,
      nombreProducto: updated.name,
      marca: updated.brand,
      pVentaClp: updated.price,
      stock: updated.stock,
      imagenUrl: updated.imagen || ''
    }

    try {
      const response = await fetch(`${API_URL}/api/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(dbFormat)
      })
      if (response.ok) {
         setCatalog((prev) => prev.map((p) => (p.id === id ? updated : p)))
      }
    } catch (error) {
       console.error("Error actualizando producto:", error)
    }
  }

  async function deleteProduct(id) {
    try {
      const response = await fetch(`${API_URL}/api/productos/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (response.ok || response.status === 204) {
        setCatalog((prev) => prev.filter((p) => p.id !== id))
      }
    } catch (error) {
      console.error("Error eliminando producto:", error)
    }
  }

  // ===== CRUD PROVEEDORES =====
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

  // ===== FUNCIONES MANTENIDAS =====
  function placeOrder({ user, items, payment, delivery, shipping = null }) {
    if (!user) return { ok: false, message: 'Debes iniciar sesión para comprar.' }
    if (!items.length) return { ok: false, message: 'Tu carrito está vacío.' }

    // Validación de stock real
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
        id: it.id, code: it.code, name: it.name, price: it.price, qty: it.qty, imagen: it.imagen,
      })),
      total: items.reduce((s, it) => s + it.price * it.qty, 0),
      payment, delivery, shipping,
      estado: delivery === 'despacho' ? 'En preparación' : 'Listo para retiro',
    }

    // Guardamos la orden (Temporalmente sin actualizar stock en backend hasta crear el MS de Compras)
    setOrders((prev) => [order, ...prev])
    return { ok: true, order }
  }

  // ===== COMPRA REAL (micro de ventas, vía gateway) =====
  // Ventas le pide a productos que descuente el stock de TODO el carrito en una sola operación.
  // Requiere sesión: el token JWT identifica al comprador (ventas no recibe el usuario en el body).
  // Si el backend acepta la compra, se guarda la orden en el navegador (historial y comprobante)
  // con los precios que registró el backend y se refleja el stock descontado en el catálogo.
  async function comprar({ user, items, payment, delivery, shipping = null }) {
    if (!user) return { ok: false, message: 'Debes iniciar sesión para comprar.' }
    if (!items.length) return { ok: false, message: 'Tu carrito está vacío.' }

    // Idempotency-Key: si la compra se reintenta con la misma clave, el backend no cobra ni descuenta dos veces.
    // crypto.randomUUID solo existe en https o localhost; en http (sitio de S3) se usa la alternativa.
    const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

    let venta
    try {
      const response = await fetch(`${API_URL}/api/ventas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey, ...authHeaders() },
        body: JSON.stringify({
          items: items.map((it) => ({ idProducto: it.id, cantidad: it.qty })),
          metodoPago: payment,
          tipoEntrega: delivery,
        }),
      })
      const data = await response.json().catch(() => null)
      if (response.status === 401) {
        return { ok: false, message: 'Tu sesión expiró. Cierra sesión e ingresa nuevamente para comprar.' }
      }
      if (!response.ok) {
        // El backend responde { mensaje: "Stock insuficiente de ..." } u otro motivo
        return { ok: false, message: data?.mensaje || 'No se pudo registrar la compra. Intenta nuevamente.' }
      }
      venta = data
    } catch (error) {
      console.error('Error conectando con el micro de ventas:', error)
      return { ok: false, message: 'No hay conexión con el servidor de ventas. Intenta nuevamente.' }
    }

    // Precios y nombres definitivos: los que registró el backend
    const lineas = new Map((venta.detalles || []).map((d) => [d.idProducto, d]))
    const order = {
      id: nextId('C', 1001, orders),
      ventaId: venta.idVenta,
      username: user.username,
      customer: user.name || user.username,
      fecha: venta.fecha || new Date().toISOString(),
      items: items.map((it) => {
        const d = lineas.get(it.id)
        return {
          id: it.id, code: it.code, name: d?.nombreProducto || it.name,
          price: d?.precioUnitario ?? it.price, qty: it.qty, imagen: it.imagen,
        }
      }),
      total: venta.total,
      payment, delivery, shipping,
      estado: delivery === 'despacho' ? 'En preparación' : 'Listo para retiro',
    }
    setOrders((prev) => [order, ...prev])
    // Reflejar en pantalla el stock que descontó el backend
    setCatalog((prev) => prev.map((p) => {
      const d = lineas.get(p.id)
      return d ? { ...p, stock: p.stock - d.cantidad } : p
    }))
    return { ok: true, order }
  }

  function addRental({ user, tool, inicio, termino, dias, pago, deposito, costo, comentarios }) {
    const rental = {
      id: nextId('A', 201, rentals), username: user.username, customer: user.name || user.username,
      herramienta: tool.name, toolId: tool.id, inicio, termino, dias, pago, deposito, costo, comentarios,
      creado: new Date().toISOString(), estado: 'Solicitado',
    }
    setRentals((prev) => [rental, ...prev])
    return rental
  }

  function addService({ user, tipo, marca, urgencia, fecha, hora, descripcion }) {
    const service = {
      id: nextId('S', 301, services), username: user.username, customer: user.name || user.username,
      servicio: `Reparación ${tipo}${marca ? ` (${marca})` : ''}`, urgencia, descripcion,
      solicitado: new Date().toISOString(), agendado: `${fecha} ${hora}`, completado: null, estado: 'Solicitado',
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
        placeOrder, comprar, addRental, addService,
        loadingProducts
      }}
    >
      {children}
    </ShopContext.Provider>
  )
}

export function useShop() {
  return useContext(ShopContext)
}