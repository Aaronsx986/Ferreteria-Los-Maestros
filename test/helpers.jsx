// Utilidades compartidas por las pruebas
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../src/context/AuthContext.jsx'
import { ShopProvider } from '../src/context/ShopContext.jsx'
import { CartProvider } from '../src/context/CartContext.jsx'

export const ADMIN = { username: 'admin', role: 'admin', name: 'Administrador Principal', email: 'admin@ferreterialosmaestros.cl', status: 'active' }
export const CLIENTE = { username: 'usuario', role: 'user', name: 'Juan Pérez', email: 'usuario@ferreterialosmaestros.cl', status: 'active' }

// Deja una sesión iniciada ANTES de montar los providers (AuthContext la lee del localStorage)
export function loginAs(user) {
  localStorage.setItem('currentUser', JSON.stringify(user))
}

// Fija el stock de productos (ShopContext lo lee de 'flm_stock': { [id]: stock })
export function setStock(map) {
  localStorage.setItem('flm_stock', JSON.stringify(map))
}

// Monta un componente con Router + los 3 providers reales de la app
export function renderApp(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <ShopProvider>
          <CartProvider>{ui}</CartProvider>
        </ShopProvider>
      </AuthProvider>
    </MemoryRouter>
  )
}
