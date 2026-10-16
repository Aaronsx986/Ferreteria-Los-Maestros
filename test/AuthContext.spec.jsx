// PRUEBAS UNITARIAS — AuthContext (estado de sesión, login, registro, logout)
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../src/context/AuthContext.jsx'
import { ADMIN, loginAs } from './helpers.jsx'

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
const setup = () => renderHook(() => useAuth(), { wrapper })

const formValido = {
  name: 'María Soto', username: 'msoto', email: 'MSoto@Correo.cl',
  phone: '+56 9 1111 2222', address: 'Calle 1, Santiago', password: 'secreto1',
}

describe('AuthContext — estado inicial', () => {
  it('sin sesión: user es null e isAdmin es false', () => {
    const { result } = setup()
    expect(result.current.user).toBeNull()
    expect(result.current.isAdmin).toBeFalse()
  })
})

describe('AuthContext.login()', () => {
  it('credenciales correctas: ok, actualiza el estado y persiste la sesión', () => {
    const { result } = setup()
    let r
    act(() => { r = result.current.login('admin', 'admin123') })
    expect(r.ok).toBeTrue()
    expect(result.current.user.username).toBe('admin')
    expect(result.current.isAdmin).toBeTrue()
    expect(JSON.parse(localStorage.getItem('currentUser')).username).toBe('admin')
  })
})

describe('AuthContext.register()', () => {
  it('crea un cliente (role "user"), lo guarda y permite iniciar sesión', () => {
    const { result } = setup()
    let r
    act(() => { r = result.current.register(formValido) })
    expect(r.ok).toBeTrue()
    const guardados = JSON.parse(localStorage.getItem('flm_users'))
    expect(guardados.length).toBe(1)
    expect(guardados[0].role).toBe('user')
    expect(guardados[0].email).toBe('msoto@correo.cl') // normalizado a minúsculas

    act(() => { r = result.current.login('msoto', 'secreto1') })
    expect(r.ok).toBeTrue()
  })
})

describe('AuthContext.logout()', () => {
  it('borra la sesión del estado y del localStorage', () => {
    loginAs(ADMIN)
    const { result } = setup()
    act(() => { result.current.logout() })
    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('currentUser')).toBeNull()
  })
})
