// Validaciones de formularios. Son funciones puras: reciben los datos y devuelven
// un objeto { campo: 'mensaje' } (vacío si todo está bien), así se pueden probar sin React.
import { soloDigitos } from './services/pago.js'

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim())

const isInt = (v) => v !== '' && v != null && Number.isInteger(Number(v))

export function validateProduct(f, products = [], editingId = null) {
  const e = {}
  const code = String(f.code || '').trim()
  if (!code) e.code = 'El código es obligatorio'
  else if (products.some((p) => p.id !== editingId && p.code.toLowerCase() === code.toLowerCase())) {
    e.code = 'Ya existe un producto con ese código'
  }
  if (!String(f.name || '').trim()) e.name = 'El nombre es obligatorio'
  if (!f.category) e.category = 'Selecciona una categoría'
  if (!String(f.brand || '').trim()) e.brand = 'La marca es obligatoria'
  if (!isInt(f.price) || Number(f.price) <= 0) e.price = 'Ingresa un precio de venta mayor a 0'
  if (!isInt(f.buyPrice) || Number(f.buyPrice) < 0) e.buyPrice = 'Ingresa un precio de compra válido'
  if (!isInt(f.stock) || Number(f.stock) < 0) e.stock = 'El stock debe ser un entero desde 0'
  if (!isInt(f.minStock) || Number(f.minStock) < 0) e.minStock = 'El stock mínimo debe ser un entero desde 0'
  const d = f.discount === '' || f.discount == null ? 0 : Number(f.discount)
  if (!Number.isInteger(d) || d < 0 || d > 90) e.discount = 'El descuento debe estar entre 0 y 90'
  return e
}

export function validateUser(f, users = [], editingUsername = null) {
  const e = {}
  const username = String(f.username || '').trim()
  const email = String(f.email || '').trim().toLowerCase()
  const editing = editingUsername !== null

  if (!String(f.name || '').trim()) e.name = 'El nombre es obligatorio'
  if (!username) e.username = 'El usuario es obligatorio'
  else if (!/^[A-Za-z0-9_.-]{3,}$/.test(username)) e.username = 'Mínimo 3 caracteres, sin espacios'
  else if (!editing && users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    e.username = 'Ese nombre de usuario ya está en uso'
  }
  if (!isEmail(email)) e.email = 'Ingresa un correo válido'
  else if (users.some((u) => u.username !== editingUsername && u.email.toLowerCase() === email)) {
    e.email = 'Ya existe una cuenta con ese correo'
  }
  // Al crear la contraseña es obligatoria; al editar solo se valida si se escribe una nueva
  if (!editing && !f.password) e.password = 'La contraseña es obligatoria'
  else if (f.password && String(f.password).length < 6) e.password = 'Mínimo 6 caracteres'
  if (!['admin', 'user'].includes(f.role)) e.role = 'Selecciona un rol'
  return e
}

export function validateSupplier(f, suppliers = [], editingId = null) {
  const e = {}
  const name = String(f.name || '').trim()
  if (!name) e.name = 'El nombre es obligatorio'
  else if (suppliers.some((s) => s.id !== editingId && s.name.toLowerCase() === name.toLowerCase())) {
    e.name = 'Ya existe un proveedor con ese nombre'
  }
  if (!String(f.contactName || '').trim()) e.contactName = 'El contacto es obligatorio'
  if (!isEmail(f.contactEmail)) e.contactEmail = 'Ingresa un correo válido'
  if (!String(f.paymentTerms || '').trim()) e.paymentTerms = 'Indica las condiciones de pago'
  if (!String(f.deliveryTime || '').trim()) e.deliveryTime = 'Indica el plazo de entrega'
  const r = Number(f.rating)
  if (f.rating === '' || isNaN(r) || r < 0 || r > 5) e.rating = 'La evaluación debe estar entre 0 y 5'
  return e
}

export function validateCheckout(f) {
  const e = {}
  if (!String(f.nombre || '').trim()) e.nombre = 'Ingresa tu nombre'
  if (!String(f.apellido || '').trim()) e.apellido = 'Ingresa tu apellido'
  if (!isEmail(f.correo)) e.correo = 'Ingresa un correo válido'
  if (f.delivery === 'despacho') {
    if (!String(f.calle || '').trim()) e.calle = 'Ingresa la calle y el número'
    if (!f.region) e.region = 'Selecciona una región'
    if (!f.comuna) e.comuna = 'Selecciona una comuna'
  }
  if (f.payment === 'debito' || f.payment === 'credito') {
    if (soloDigitos(f.tarjeta).length !== 16) e.tarjeta = 'La tarjeta debe tener 16 dígitos'
  }
  return e
}
