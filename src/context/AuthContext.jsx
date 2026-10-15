import { createContext, useContext, useState } from 'react'
import usersData from '../data/users.json'
import { load, save } from '../utils.js'

const AuthContext = createContext(null)
const USER_KEY = 'currentUser'
const REGISTERED_KEY = 'flm_users'

// Nunca se guarda la contraseña en la sesión
function publicUser(u) {
  const { password, ...rest } = u
  return rest
}

export function AuthProvider({ children }) {
  const [registered, setRegistered] = useState(() => load(REGISTERED_KEY, []))
  const [user, setUser] = useState(() => load(USER_KEY, null))

  // Usuarios de users.json + los que se crearon desde "Regístrate"
  const users = [...usersData.users, ...registered]

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

  function register(form) {
    const username = form.username.trim()
    const email = form.email.trim().toLowerCase()
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return { ok: false, message: 'Ese nombre de usuario ya está en uso' }
    }
    if (users.some((u) => u.email.toLowerCase() === email)) {
      return { ok: false, message: 'Ya existe una cuenta con ese correo' }
    }
    const now = new Date().toISOString()
    const newUser = {
      username,
      password: form.password,
      role: 'user', // el registro público siempre crea clientes
      name: form.name.trim(),
      email,
      phone: form.phone.trim(),
      address: { street: form.address.trim(), city: '', country: 'Chile' },
      status: 'active',
      created: now,
      updated: now,
    }
    const next = [...registered, newUser]
    setRegistered(next)
    save(REGISTERED_KEY, next)
    return { ok: true }
  }

  function logout() {
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, users, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
