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

  it('restaura la sesión guardada en localStorage al montar', () => {
    loginAs(ADMIN)
    const { result } = setup()
    expect(result.current.user.username).toBe('admin')
    expect(result.current.isAdmin).toBeTrue()
  })

  it('expone los usuarios de users.json', () => {
    const { result } = setup()
    expect(result.current.users.map((u) => u.username)).toEqual(['admin', 'usuario'])
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

  it('NUNCA guarda la contraseña en la sesión (seguridad básica)', () => {
    const { result } = setup()
    act(() => { result.current.login('usuario', 'user123') })
    expect(result.current.user.password).toBeUndefined()
    expect(localStorage.getItem('currentUser')).not.toContain('user123')
  })

  it('ignora mayúsculas y espacios en el nombre de usuario', () => {
    const { result } = setup()
    let r
    act(() => { r = result.current.login('  ADMIN  ', 'admin123') })
    expect(r.ok).toBeTrue()
  })

  it('contraseña incorrecta: ok=false con mensaje y sin sesión', () => {
    const { result } = setup()
    let r
    act(() => { r = result.current.login('admin', 'mala') })
    expect(r.ok).toBeFalse()
    expect(r.message).toBe('Usuario o contraseña incorrectos')
    expect(result.current.user).toBeNull()
  })

  it('usuario inexistente: ok=false', () => {
    const { result } = setup()
    let r
    act(() => { r = result.current.login('fantasma', 'x') })
    expect(r.ok).toBeFalse()
  })

  it('cuenta inactiva: rechaza el ingreso', () => {
    localStorage.setItem('flm_users', JSON.stringify([
      { username: 'baja', password: 'abc123', role: 'user', name: 'Baja', email: 'b@b.cl', status: 'inactive' },
    ]))
    const { result } = setup()
    let r
    act(() => { r = result.current.login('baja', 'abc123') })
    expect(r.ok).toBeFalse()
    expect(r.message).toBe('Tu cuenta está inactiva')
  })

  it('un cliente no es administrador', () => {
    const { result } = setup()
    act(() => { result.current.login('usuario', 'user123') })
    expect(result.current.isAdmin).toBeFalse()
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

  it('el registro público nunca puede crear administradores', () => {
    const { result } = setup()
    act(() => { result.current.register({ ...formValido, role: 'admin' }) })
    expect(JSON.parse(localStorage.getItem('flm_users'))[0].role).toBe('user')
  })

  it('rechaza un nombre de usuario ya existente (sin importar mayúsculas)', () => {
    const { result } = setup()
    let r
    act(() => { r = result.current.register({ ...formValido, username: 'ADMIN' }) })
    expect(r.ok).toBeFalse()
    expect(r.message).toBe('Ese nombre de usuario ya está en uso')
  })

  it('rechaza un correo ya registrado', () => {
    const { result } = setup()
    let r
    act(() => { r = result.current.register({ ...formValido, email: 'admin@ferreterialosmaestros.cl' }) })
    expect(r.ok).toBeFalse()
    expect(r.message).toBe('Ya existe una cuenta con ese correo')
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
