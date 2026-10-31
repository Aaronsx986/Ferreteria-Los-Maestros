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

  it('calcula los días a partir de las fechas (inclusive)', () => {
    const { container } = renderApp(<Arriendo />)
    cambiar(container, 'inicio', '2099-01-01')
    cambiar(container, 'devolucion', '2099-01-03')
    expect(campo(container, 'dias').value).toBe('3')
  })

  it('muestra depósito (2× precio/día) y costo estimado al elegir herramienta', () => {
    const { container } = renderApp(<Arriendo />)
    cambiar(container, 'herramienta', '20') // Martillo $7.990
    cambiar(container, 'inicio', '2099-01-01')
    cambiar(container, 'devolucion', '2099-01-03')
    expect(screen.getByDisplayValue('$15.980')).toBeInTheDocument()
    expect(screen.getByText(/Costo estimado: \$23\.970/)).toBeInTheDocument()
  })

  it('rechaza una devolución anterior al inicio', () => {
    const { container } = renderApp(<Arriendo />)
    cambiar(container, 'herramienta', '20')
    cambiar(container, 'inicio', '2099-01-05')
    cambiar(container, 'devolucion', '2099-01-01')
    fireEvent.submit(container.querySelector('form'))
    expect(screen.getByText(/no puede ser anterior/)).toBeInTheDocument()
    expect(localStorage.getItem('flm_rentals')).toBe('[]')
  })

  it('solicitud válida: confirma, guarda el arriendo y limpia el formulario', () => {
    const { container } = renderApp(<Arriendo />)
    cambiar(container, 'herramienta', '20')
    cambiar(container, 'inicio', '2099-01-01')
    cambiar(container, 'devolucion', '2099-01-03')
    fireEvent.submit(container.querySelector('form'))
    expect(screen.getByText(/Solicitud de arriendo enviada/)).toBeInTheDocument()
    const guardado = JSON.parse(localStorage.getItem('flm_rentals'))[0]
    expect(guardado.id).toBe('A-201')
    expect(guardado.costo).toBe(23970)
    expect(guardado.deposito).toBe(15980)
    expect(campo(container, 'herramienta').value).toBe('')
  })
})

describe('Reparacion — servicio técnico', () => {
  beforeEach(() => loginAs(CLIENTE))

  it('tiene las 3 opciones de urgencia con "normal" por defecto', () => {
    renderApp(<Reparacion />)
    expect(screen.getAllByRole('radio').length).toBe(3)
    expect(screen.getByLabelText('normal').checked).toBeTrue()
  })

  it('cambiar la urgencia actualiza el estado del formulario', () => {
    renderApp(<Reparacion />)
    fireEvent.click(screen.getByLabelText('alta'))
    expect(screen.getByLabelText('alta').checked).toBeTrue()
    expect(screen.getByLabelText('normal').checked).toBeFalse()
  })

  it('envía la solicitud: guarda el servicio S-301 y muestra confirmación', () => {
    const { container } = renderApp(<Reparacion />)
    cambiar(container, 'tipo', 'Taladro')
    cambiar(container, 'marca', 'Makita')
    cambiar(container, 'fecha', '2099-05-01')
    cambiar(container, 'hora', '10:30')
    cambiar(container, 'descripcion', 'No enciende')
    fireEvent.click(screen.getByLabelText('alta'))
    fireEvent.submit(container.querySelector('form'))
    expect(screen.getByText(/Solicitud de servicio enviada/)).toBeInTheDocument()
    const s = JSON.parse(localStorage.getItem('flm_services'))[0]
    expect(s.id).toBe('S-301')
    expect(s.servicio).toBe('Reparación Taladro (Makita)')
    expect(s.urgencia).toBe('alta')
    expect(campo(container, 'tipo').value).toBe('') // formulario limpio
  })

  it('los campos obligatorios están marcados como required', () => {
    const { container } = renderApp(<Reparacion />)
    ;['tipo', 'fecha', 'hora', 'descripcion'].forEach((n) => expect(campo(container, n).required).toBeTrue())
    expect(campo(container, 'marca').required).toBeFalse()
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

  it('muestra solo las compras del usuario con sesión', () => {
    loginAs(CLIENTE)
    localStorage.setItem('flm_orders', JSON.stringify([orden('C-1001', 'usuario'), orden('C-1002', 'otro')]))
    renderApp(<Historial />)
    expect(screen.getByText('C-1001')).toBeInTheDocument()
    expect(screen.queryByText('C-1002')).toBeNull()
  })

  it('resume cuántas compras y cuánto ha gastado', () => {
    loginAs(CLIENTE)
    localStorage.setItem('flm_orders', JSON.stringify([orden('C-1001', 'usuario', 10000), orden('C-1002', 'usuario', 5000)]))
    renderApp(<Historial />)
    expect(screen.getByText(/Llevas 2 compras por \$15\.000/)).toBeInTheDocument()
  })

  it('el botón de detalle despliega y oculta los productos de la compra', () => {
    loginAs(CLIENTE)
    localStorage.setItem('flm_orders', JSON.stringify([orden('C-1001', 'usuario')]))
    renderApp(<Historial />)
    expect(screen.queryByText('Retiro en tienda Santiago Centro')).toBeNull()
    fireEvent.click(screen.getByLabelText('Ver detalle'))
    expect(screen.getByText('Retiro en tienda Santiago Centro')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Ver detalle'))
    expect(screen.queryByText('Retiro en tienda Santiago Centro')).toBeNull()
  })

  it('tras comprar muestra el aviso de éxito con el ID de la orden', () => {
    loginAs(CLIENTE)
    localStorage.setItem('flm_orders', JSON.stringify([orden('C-1001', 'usuario')]))
    renderApp(<Historial />, { route: { pathname: '/historial', state: { newOrder: 'C-1001' } } })
    expect(screen.getByText(/realizada con éxito/)).toBeInTheDocument()
  })

  it('lista arriendos y servicios del usuario', () => {
    loginAs(CLIENTE)
    localStorage.setItem('flm_rentals', JSON.stringify([{ id: 'A-201', username: 'usuario', herramienta: 'Taladro', inicio: '2099-01-01', termino: '2099-01-02', costo: 1000, estado: 'Solicitado' }]))
    localStorage.setItem('flm_services', JSON.stringify([{ id: 'S-301', username: 'usuario', servicio: 'Reparación Sierra', solicitado: '2026-10-01T00:00:00Z', agendado: '2099-01-01 10:00', estado: 'Solicitado' }]))
    renderApp(<Historial />)
    expect(screen.getByText('A-201')).toBeInTheDocument()
    expect(screen.getByText('S-301')).toBeInTheDocument()
  })
})
