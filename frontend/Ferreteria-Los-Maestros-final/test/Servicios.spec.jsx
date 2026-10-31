// PRUEBAS DE COMPONENTE — Arriendo, Reparación (servicio técnico) e Historial
import { screen, fireEvent } from '@testing-library/react'
import Arriendo from '../src/pages/Arriendo.jsx'
import Reparacion from '../src/pages/Reparacion.jsx'
import Historial from '../src/pages/Historial.jsx'
import { renderApp, loginAs, CLIENTE } from './helpers.jsx'

const campo = (c, name) => c.querySelector(`[name="${name}"]`)
const cambiar = (c, name, value) => fireEvent.change(campo(c, name), { target: { name, value } })

describe('Arriendo', () => {
  beforeEach(() => loginAs(CLIENTE))

  it('ofrece solo herramientas en el selector', () => {
    const { container } = renderApp(<Arriendo />)
    const opciones = [...campo(container, 'herramienta').options].map((o) => o.textContent)
    expect(opciones.length).toBe(17) // placeholder + 16 herramientas
    expect(opciones.some((t) => t.includes('Martillo carpintero 500g'))).toBeTrue()
  })
})

describe('Reparacion — servicio técnico', () => {
  beforeEach(() => loginAs(CLIENTE))

  it('tiene las 3 opciones de urgencia con "normal" por defecto', () => {
    renderApp(<Reparacion />)
    expect(screen.getAllByRole('radio').length).toBe(3)
    expect(screen.getByLabelText('normal').checked).toBeTrue()
  })
})

describe('Historial', () => {
  const orden = (id, username, total = 10000) => ({
    id, username, customer: username, fecha: '2026-10-01T12:00:00Z', total, payment: 'debito', delivery: 'retiro',
    estado: 'Listo para retiro', items: [{ id: 1, name: 'Cemento Polpaico gris 25 kg', price: 5000, qty: 2, imagen: '' }],
  })

  it('sin actividad muestra los 3 mensajes de vacío', () => {
    loginAs(CLIENTE)
    renderApp(<Historial />)
    expect(screen.getByText(/Aún no tienes compras/)).toBeInTheDocument()
    expect(screen.getByText(/Sin arriendos/)).toBeInTheDocument()
    expect(screen.getByText(/Sin solicitudes/)).toBeInTheDocument()
  })
})
