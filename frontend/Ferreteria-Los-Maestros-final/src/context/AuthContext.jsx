import { createContext, useContext, useState } from 'react'
import usersData from '../data/users.json'
import { load, save } from '../utils.js'

const AuthContext = createContext(null)
const USER_KEY = 'currentUser'
const REGISTERED_KEY = 'flm_users'          // usuarios creados (registro público o panel admin)
const CHANGES_KEY = 'flm_user_changes'      // ediciones y bajas: { edits: {username: cambios}, removed: [username] }

// Nunca se guarda la contraseña en la sesión
function publicUser(u) {
  const { password, ...rest } = u
  return rest
}

export function AuthProvider({ children }) {
  const [registered, setRegistered] = useState(() => load(REGISTERED_KEY, []))
  const [changes, setChanges] = useState(() => load(CHANGES_KEY, { edits: {}, removed: [] }))
  const [user, setUser] = useState(() => load(USER_KEY, null))

  // Usuarios de users.json + los creados, menos los eliminados y con las ediciones aplicadas
  const users = [...usersData.users, ...registered]
    .filter((u) => !changes.removed.includes(u.username))
    .map((u) => ({ ...u, ...changes.edits[u.username] }))

  // Para validar duplicados se consideran también los usuarios dados de baja
  const allUsernames = [...usersData.users, ...registered].map((u) => u.username.toLowerCase())

  function saveChanges(next) {
    setChanges(next)
    save(CHANGES_KEY, next)
  }

  function login(username, password) {
    const name = username.trim().toLowerCase()
    const found = users.find(
      (u) => u.username.toLowerCase() === name && u.password === password
    )
    if (!found) return { ok: false, message: 'Usuario o contraseña incorrectos' }
    if (found.status && found.status !== 'active') {
      return { ok: false, message: 'Tu cuenta está inactiva' }
    }
    const session = publicUser(found)
    save(USER_KEY, session)
    setUser(session)
    return { ok: true }
  }

  // Crea un usuario. Lo usan el registro público (siempre cliente) y el panel de administración.
  function addUser(data) {
    const username = data.username.trim()
    const email = data.email.trim().toLowerCase()
    if (allUsernames.includes(username.toLowerCase())) {
      return { ok: false, message: 'Ese nombre de usuario ya está en uso' }
    }
    if (users.some((u) => u.email.toLowerCase() === email)) {
      return { ok: false, message: 'Ya existe una cuenta con ese correo' }
    }
    const now = new Date().toISOString()
    const newUser = {
      username,
      password: data.password,
      role: data.role || 'user',
      name: data.name.trim(),
      email,
      phone: (data.phone || '').trim(),
      address: { street: (data.address || '').trim(), city: '', country: 'Chile' },
      status: data.status || 'active',
      created: now,
      updated: now,
    }
    const next = [...registered, newUser]
    setRegistered(next)
    save(REGISTERED_KEY, next)
    return { ok: true }
  }

  // El registro público siempre crea clientes activos
  function register(form) {
    return addUser({ ...form, role: 'user', status: 'active' })
  }

  function updateUser(username, patch) {
    const current = users.find((u) => u.username === username)
    if (!current) return { ok: false, message: 'El usuario no existe' }
    const isSelf = user?.username === username
    if (isSelf && patch.role && patch.role !== 'admin') {
      return { ok: false, message: 'No puedes quitarte el rol de administrador a ti mismo' }
    }
    if (isSelf && patch.status && patch.status !== 'active') {
      return { ok: false, message: 'No puedes desactivar tu propia cuenta' }
    }
    const email = patch.email?.trim().toLowerCase()
    if (email && users.some((u) => u.username !== username && u.email.toLowerCase() === email)) {
      return { ok: false, message: 'Ya existe una cuenta con ese correo' }
    }
    const cleaned = { ...patch, ...(email ? { email } : {}), updated: new Date().toISOString() }
    if (!cleaned.password) delete cleaned.password // contraseña vacía = no cambiarla
    saveChanges({
      ...changes,
      edits: { ...changes.edits, [username]: { ...changes.edits[username], ...cleaned } },
    })
    if (isSelf) {
      const session = publicUser({ ...current, ...cleaned })
      save(USER_KEY, session)
      setUser(session)
    }
    return { ok: true }
  }

  function deleteUser(username) {
    if (user?.username === username) {
      return { ok: false, message: 'No puedes eliminar tu propia cuenta' }
    }
    const { [username]: _gone, ...edits } = changes.edits
    if (registered.some((u) => u.username === username)) {
      // Fue creado desde la app: se borra de verdad
      const next = registered.filter((u) => u.username !== username)
      setRegistered(next)
      save(REGISTERED_KEY, next)
      saveChanges({ ...changes, edits })
    } else {
      // Viene de users.json (semilla): se marca como eliminado
      saveChanges({ edits, removed: [...changes.removed, username] })
    }
    return { ok: true }
  }

  function logout() {
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider
      value={{ user, users, login, register, addUser, updateUser, deleteUser, logout, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
