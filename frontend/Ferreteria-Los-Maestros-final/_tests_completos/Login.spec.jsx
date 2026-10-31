// PRUEBAS DE COMPONENTE — Login y CrearUsuario (formularios controlados, validación, navegación)
import { screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import Login from '../src/pages/Login.jsx'
import CrearUsuario from '../src/pages/CrearUsuario.jsx'
import { renderApp } from './helpers.jsx'

const rutasLogin = (
  <Routes>
    <Route path="/" element={<p>Pantalla inicio</p>} />
    <Route path="/carrito" element={<p>Pantalla carrito</p>} />
    <Route path="/login" element={<Login />} />
  </Routes>
)

describe('Login — formulario', () => {
  it('muestra los campos usuario y contraseña y el botón Ingresar', () => {
    renderApp(<Login />)
    expect(screen.getByPlaceholderText('admin o usuario')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••').type).toBe('password')
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeInTheDocument()
  })

  it('el estado del formulario refleja lo que escribe el usuario', async () => {
    renderApp(<Login />)
    const user = userEvent.setup()
    const campo = screen.getByPlaceholderText('admin o usuario')
    await user.type(campo, 'admin')
    expect(campo.value).toBe('admin')
  })

  it('credenciales incorrectas: muestra el mensaje de error y no navega', async () => {
    renderApp(rutasLogin, { route: '/login' })
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('admin o usuario'), 'admin')
    await user.type(screen.getByPlaceholderText('••••••••'), 'incorrecta')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(await screen.findByText('Usuario o contraseña incorrectos')).toBeInTheDocument()
    expect(screen.queryByText('Pantalla inicio')).toBeNull()
  })

  it('credenciales correctas: guarda la sesión y navega al inicio', async () => {
    renderApp(rutasLogin, { route: '/login' })
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('admin o usuario'), 'usuario')
    await user.type(screen.getByPlaceholderText('••••••••'), 'user123')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(await screen.findByText('Pantalla inicio')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('currentUser')).username).toBe('usuario')
  })

  it('vuelve a la página que el usuario quería visitar (state.from)', async () => {
    renderApp(rutasLogin, { route: { pathname: '/login', state: { from: { pathname: '/carrito' } } } })
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('admin o usuario'), 'usuario')
    await user.type(screen.getByPlaceholderText('••••••••'), 'user123')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(await screen.findByText('Pantalla carrito')).toBeInTheDocument()
  })

  it('los campos son obligatorios (validación HTML5)', () => {
    renderApp(<Login />)
    expect(screen.getByPlaceholderText('admin o usuario').required).toBeTrue()
    expect(screen.getByPlaceholderText('••••••••').required).toBeTrue()
  })

  it('ofrece el enlace para registrarse', () => {
    renderApp(<Login />)
    expect(screen.getByRole('link', { name: 'Regístrate' }).getAttribute('href')).toBe('/crear-usuario')
  })
})

describe('CrearUsuario — registro', () => {
  const llenar = (c, datos) =>
    Object.entries(datos).forEach(([name, value]) =>
      fireEvent.change(c.querySelector(`[name="${name}"]`), { target: { name, value } })
    )
  const valido = { name: 'Ana Rojas', username: 'arojas', email: 'ana@correo.cl', phone: '+56 9 1', address: 'Calle 1', password: 'clave123' }

  it('actualiza el estado al escribir en cada campo', () => {
    const { container } = renderApp(<CrearUsuario />)
    llenar(container, valido)
    expect(container.querySelector('[name="username"]').value).toBe('arojas')
    expect(container.querySelector('[name="email"]').value).toBe('ana@correo.cl')
  })

  it('exige contraseña de al menos 6 caracteres y correo con formato válido', () => {
    const { container } = renderApp(<CrearUsuario />)
    expect(container.querySelector('[name="password"]').minLength).toBe(6)
    expect(container.querySelector('[name="email"]').type).toBe('email')
  })

  it('registro exitoso: muestra confirmación, guarda el usuario y redirige al login', () => {
    jasmine.clock().install()
    try {
      const { container } = renderApp(
        <Routes>
          <Route path="/crear-usuario" element={<CrearUsuario />} />
          <Route path="/login" element={<p>Pantalla login</p>} />
        </Routes>,
        { route: '/crear-usuario' }
      )
      llenar(container, valido)
      fireEvent.submit(container.querySelector('form'))
      expect(screen.getByText(/Cuenta creada/)).toBeInTheDocument()
      expect(JSON.parse(localStorage.getItem('flm_users'))[0].username).toBe('arojas')
      act(() => { jasmine.clock().tick(1600) })
      expect(screen.getByText('Pantalla login')).toBeInTheDocument()
    } finally {
      jasmine.clock().uninstall()
    }
  })

  it('usuario repetido: muestra error y NO guarda', () => {
    const { container } = renderApp(<CrearUsuario />)
    llenar(container, { ...valido, username: 'admin' })
    fireEvent.submit(container.querySelector('form'))
    expect(screen.getByText('Ese nombre de usuario ya está en uso')).toBeInTheDocument()
    expect(localStorage.getItem('flm_users')).toBeNull()
  })

  it('correo repetido: muestra error', () => {
    const { container } = renderApp(<CrearUsuario />)
    llenar(container, { ...valido, email: 'usuario@ferreterialosmaestros.cl' })
    fireEvent.submit(container.querySelector('form'))
    expect(screen.getByText('Ya existe una cuenta con ese correo')).toBeInTheDocument()
  })
})
