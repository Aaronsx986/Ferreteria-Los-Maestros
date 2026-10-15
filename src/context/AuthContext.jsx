import { createContext, useContext, useState } from 'react'
import usersData from '../data/users.json'

const AuthContext = createContext(null)
const USER_KEY = 'currentUser'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY))
    } catch {
      return null
    }
  })

  // Equivalente a buscar en data/users.json y validar usuario/clave
  function login(username, password) {
    const found = usersData.users.find(
      (u) => u.username === username && u.password === password
    )
    if (!found) return { ok: false, message: 'Usuario o contraseña incorrectos' }
    localStorage.setItem(USER_KEY, JSON.stringify(found))
    setUser(found)
    return { ok: true }
  }

  function logout() {
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
