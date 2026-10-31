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
})
