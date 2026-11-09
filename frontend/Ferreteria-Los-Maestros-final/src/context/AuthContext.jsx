import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { API_URL } from '../config.js'
import { TOKEN_EXPIRA_KEY, TOKEN_KEY, authHeaders } from '../services/api.js'
import { load, save } from '../utils.js'

// Sesión y usuarios contra el MICRO DE USUARIOS (vía gateway): /api/auth/** y /api/usuarios/**.
// El login devuelve un JWT que se guarda en el navegador y se envía en las peticiones protegidas.
// Las funciones mantienen sus nombres y respuestas ({ ok, message }), pero ahora son async.

const AuthContext = createContext(null)
const USER_KEY = 'currentUser'

// Roles y estados: backend (ADMIN/VENDEDOR/CLIENTE, ACTIVO/INACTIVO) <-> frontend (admin/seller/user, active/inactive)
const ROL_A_FRONT = { ADMIN: 'admin', VENDEDOR: 'seller', CLIENTE: 'user' }
const ROL_A_BACK = { admin: 'ADMIN', seller: 'VENDEDOR', user: 'CLIENTE' }

// Usuario del backend -> forma que usa el resto del frontend
function aFront(u) {
  return {
    id: u.id,
    username: u.nombreUsuario,
    name: u.nombre,
    email: u.correo,
    phone: u.telefono || '',
    role: ROL_A_FRONT[u.rol] || 'user',
    status: u.estado === 'ACTIVO' ? 'active' : 'inactive',
    address: {
      street: u.direccion?.calle || '',
      city: u.direccion?.comuna || '',
      region: u.direccion?.region || '',
      country: u.direccion?.pais || 'Chile',
    },
    created: u.creadoEn,
    lastLogin: u.ultimoLogin,
  }
}

// La dirección llega como texto (registro) o como objeto (usuario ya existente)
function direccionABack(address) {
  if (!address) return null
  if (typeof address === 'string') return address.trim() ? { calle: address.trim() } : null
  return {
    calle: address.street || '',
    comuna: address.city || '',
    region: address.region || '',
    pais: address.country || 'Chile',
  }
}

// fetch al backend; devuelve { ok, data } o { ok: false, status, message } con el mensaje del backend.
// conToken=false en login y registro: un token vencido haría que el backend responda 401.
async function llamar(path, { method = 'GET', body, conToken = true } = {}) {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(conToken ? authHeaders() : {}) },
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = response.status === 204 ? null : await response.json().catch(() => null)
    if (!response.ok) {
      const detalle = data?.errores ? Object.values(data.errores)[0] : null
      return {
        ok: false,
        status: response.status,
        message: detalle || data?.mensaje || 'No se pudo completar la operación.',
      }
    }
    return { ok: true, data }
  } catch (error) {
    console.error('Error conectando con el micro de usuarios:', error)
    return { ok: false, message: 'No hay conexión con el servidor. Intenta nuevamente.' }
  }
}

// Sesión guardada: solo vale si hay token y no está vencido (una sesión antigua sin token se descarta)
function sesionGuardada() {
  const token = load(TOKEN_KEY, null)
  const expira = load(TOKEN_EXPIRA_KEY, null)
  if (!token || (expira && new Date(expira) <= new Date())) {
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRA_KEY)
    return null
  }
  return load(USER_KEY, null)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(sesionGuardada)
  const [users, setUsers] = useState([])        // solo se cargan si el usuario es administrador
  const isAdmin = user?.role === 'admin'

  const logout = useCallback(() => {
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRA_KEY)
    setUser(null)
    setUsers([])
  }, [])

  const recargarUsuarios = useCallback(async () => {
    const r = await llamar('/api/usuarios')
    if (r.ok) setUsers(r.data.map(aFront))
    else if (r.status === 401) logout()          // token vencido
    return r
  }, [logout])

  useEffect(() => {
    if (isAdmin) recargarUsuarios()
  }, [isAdmin, recargarUsuarios])

  async function login(username, password) {
    const r = await llamar('/api/auth/login', {
      method: 'POST',
      body: { nombreUsuario: username.trim(), password },
      conToken: false,
    })
    if (!r.ok) return { ok: false, message: r.message }
    const session = aFront(r.data.usuario)
    save(TOKEN_KEY, r.data.token)
    save(TOKEN_EXPIRA_KEY, r.data.expiraEn)
    save(USER_KEY, session)
    setUser(session)
    return { ok: true }
  }

  // Registro público: el backend siempre crea un CLIENTE activo
  async function register(form) {
    const r = await llamar('/api/auth/registro', {
      method: 'POST',
      conToken: false,
      body: {
        nombre: form.name.trim(),
        nombreUsuario: form.username.trim(),
        correo: form.email.trim(),
        telefono: (form.phone || '').trim(),
        password: form.password,
        direccion: direccionABack(form.address),
      },
    })
    return r.ok ? { ok: true } : { ok: false, message: r.message }
  }

  // Crear usuario desde el panel de administración (respeta rol y estado)
  async function addUser(data) {
    const r = await llamar('/api/usuarios', {
      method: 'POST',
      body: {
        nombre: data.name.trim(),
        nombreUsuario: data.username.trim(),
        correo: data.email.trim(),
        telefono: (data.phone || '').trim(),
        password: data.password,
        direccion: direccionABack(data.address),
        rol: ROL_A_BACK[data.role] || 'CLIENTE',
        estado: data.status === 'inactive' ? 'INACTIVO' : 'ACTIVO',
      },
    })
    if (!r.ok) return { ok: false, message: r.message }
    await recargarUsuarios()
    return { ok: true }
  }

  async function updateUser(username, patch) {
    const current = users.find((u) => u.username === username)
    if (!current) return { ok: false, message: 'El usuario no existe' }
    const isSelf = user?.username === username
    if (isSelf && patch.role && patch.role !== 'admin') {
      return { ok: false, message: 'No puedes quitarte el rol de administrador a ti mismo' }
    }
    if (isSelf && patch.status && patch.status !== 'active') {
      return { ok: false, message: 'No puedes desactivar tu propia cuenta' }
    }
    const merged = { ...current, ...patch }
    const r = await llamar(`/api/usuarios/${current.id}`, {
      method: 'PUT',
      body: {
        nombre: merged.name.trim(),
        correo: merged.email.trim(),
        telefono: (merged.phone || '').trim(),
        password: patch.password || '',          // vacío = no cambiar la contraseña
        direccion: direccionABack(merged.address),
        rol: ROL_A_BACK[merged.role] || 'CLIENTE',
        estado: merged.status === 'inactive' ? 'INACTIVO' : 'ACTIVO',
      },
    })
    if (!r.ok) return { ok: false, message: r.message }
    if (isSelf) {
      const session = aFront(r.data)
      save(USER_KEY, session)
      setUser(session)
    }
    await recargarUsuarios()
    return { ok: true }
  }

  // "Eliminar" = desactivar en el backend: el usuario queda INACTIVO y no puede iniciar sesión
  async function deleteUser(username) {
    if (user?.username === username) {
      return { ok: false, message: 'No puedes eliminar tu propia cuenta' }
    }
    const current = users.find((u) => u.username === username)
    if (!current) return { ok: false, message: 'El usuario no existe' }
    const r = await llamar(`/api/usuarios/${current.id}`, { method: 'DELETE' })
    if (!r.ok) return { ok: false, message: r.message }
    await recargarUsuarios()
    return { ok: true }
  }

  return (
    <AuthContext.Provider
      value={{ user, users, login, register, addUser, updateUser, deleteUser, logout, isAdmin, recargarUsuarios }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
