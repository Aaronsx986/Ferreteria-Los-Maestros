// PRUEBAS DE INTEGRACIÓN — App completa (rutas, protección de acceso y flujo de compra extremo a extremo)
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../src/App.jsx'
import { AuthProvider } from '../src/context/AuthContext.jsx'
import { ShopProvider } from '../src/context/ShopContext.jsx'
import { CartProvider } from '../src/context/CartContext.jsx'
import { loginAs, ADMIN, CLIENTE } from './helpers.jsx'

// Igual que main.jsx pero con MemoryRouter para poder elegir la ruta inicial
const montar = (route = '/') =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider><ShopProvider><CartProvider><App /></CartProvider></ShopProvider></AuthProvider>
    </MemoryRouter>
  )

describe('App — rutas públicas', () => {
  it('"/" muestra el inicio con el encabezado, destacados y pie de página', () => {
    montar('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Materiales de construcción')
    expect(screen.getByText('Productos destacados')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})

describe('App — rutas protegidas', () => {
  it('sin sesión, /carrito redirige al login', () => {
    montar('/carrito')
    expect(screen.getByText('Bienvenido de nuevo')).toBeInTheDocument()
  })
})

describe('App — rutas nuevas y 404', () => {
  it('una ruta inexistente muestra la página 404', () => {
    montar('/esta-ruta-no-existe')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('404')
    expect(screen.getByRole('link', { name: 'Ir al inicio' }).getAttribute('href')).toBe('/')
  })
})

describe('App — flujo completo de compra (integración)', () => {
  it('login → buscar → carrito → checkout → pago exitoso → aparece en el historial y baja el stock', async () => {
    const user = userEvent.setup()
    montar('/login')

    // 1) Inicia sesión como cliente
    await user.type(screen.getByPlaceholderText('admin o usuario'), 'usuario')
    await user.type(screen.getByPlaceholderText('••••••••'), 'user123')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(await screen.findByText('Productos destacados')).toBeInTheDocument()

    // 2) Busca desde el header
    fireEvent.change(screen.getAllByRole('searchbox')[0], { target: { value: 'Polpaico' } })
    fireEvent.submit(screen.getAllByRole('search')[0])
    expect(await screen.findByText(/resultados para/)).toBeInTheDocument()

    // 3) Agrega el cemento al carrito
    await user.click(screen.getAllByRole('button', { name: /Agregar al carrito/ })[0])
    expect(document.querySelector('.badge-cart').textContent).toBe('1')

    // 4) Va al carrito y de ahí al checkout (los datos del cliente ya vienen completos)
    await user.click(screen.getByRole('link', { name: /Carrito/ }))
    await user.click(await screen.findByRole('link', { name: /Ir a pagar/ }))
    expect(await screen.findByRole('heading', { name: 'Finalizar compra' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre').value).toBe('Cliente')

    // 5) La dirección también viene de su perfil: solo falta la tarjeta
    expect(screen.getByLabelText('Calle').value).toBe('Calle Secundaria 456')
    expect(screen.getByLabelText('Comuna').value).toBe('Valparaíso')
    await user.type(screen.getByLabelText('Número de tarjeta'), '4111111111111111')
    await user.click(screen.getByRole('button', { name: /Pagar ahora/ }))

    // 6) Ve el comprobante, luego el historial, y el stock bajó
    expect(await screen.findByRole('heading', { name: /Se ha realizado la compra nro #C-1001/ })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Ver mi historial' }))
    expect(await screen.findByRole('heading', { name: 'Mi historial' })).toBeInTheDocument()
    expect(screen.getAllByText('C-1001').length).toBeGreaterThan(0)
    expect(document.querySelector('.badge-cart')).toBeNull() // carrito vacío
    const stock = JSON.parse(localStorage.getItem('flm_stock'))
    expect(Object.values(stock).length).toBe(1)
  })
})
