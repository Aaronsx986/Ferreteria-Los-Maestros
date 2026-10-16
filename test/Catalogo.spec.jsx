// PRUEBAS DE COMPONENTE — Catalogo (filtros, búsqueda, orden; la URL es la fuente de verdad)
import { screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Catalogo from '../src/pages/Catalogo.jsx'
import Home from '../src/pages/Home.jsx'
import { renderApp, setStock } from './helpers.jsx'

const montar = (qs = '') => renderApp(<Catalogo />, { route: `/catalogo${qs}` })
const tarjetas = (c) => c.querySelectorAll('.flm-product-card')
const contador = () => screen.getByText(/productos? encontrados?/)

describe('Catalogo — listado', () => {
  it('sin filtros muestra los 85 productos', () => {
    const { container } = montar()
    expect(contador()).toHaveTextContent('85 productos encontrados')
    expect(tarjetas(container).length).toBe(85)
  })
})

describe('Catalogo — filtros desde la URL', () => {
  it('?cat=herramientas muestra solo las 16 herramientas y el título de la categoría', () => {
    const { container } = montar('?cat=herramientas')
    expect(contador()).toHaveTextContent('16 productos encontrados')
    expect(tarjetas(container).length).toBe(16)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Herramientas')
  })
})

describe('Catalogo — interacción del usuario', () => {
  it('escribir en el buscador filtra en vivo', async () => {
    montar()
    await userEvent.setup().type(screen.getByPlaceholderText(/Buscar por código/), 'martillo')
    expect(screen.getByText('Martillo carpintero 500g')).toBeInTheDocument()
    expect(screen.queryByText('Cemento Polpaico gris 25 kg')).toBeNull()
  })
})

describe('Home — productos destacados', () => {
  it('muestra el título y 8 destacados (uno por categoría)', () => {
    const { container } = renderApp(<Home />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Materiales de construcción')
    expect(tarjetas(container).length).toBe(8)
  })
})

describe('Catalogo — subcategoría, marca y rango de precio', () => {
  it('elegir subcategoría filtra los productos', async () => {
    const { container } = montar('?cat=construccion')
    await userEvent.setup().selectOptions(screen.getByLabelText('Subcategoría'), 'Cementos')
    expect(tarjetas(container).length).toBe(2)
  })
})
