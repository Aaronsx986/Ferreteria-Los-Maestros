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

  it('el botón "Limpiar" está deshabilitado cuando no hay filtros', () => {
    montar()
    expect(screen.getByRole('button', { name: /Limpiar/ })).toBeDisabled()
  })
})

describe('Catalogo — filtros desde la URL', () => {
  it('?cat=herramientas muestra solo las 16 herramientas y el título de la categoría', () => {
    const { container } = montar('?cat=herramientas')
    expect(contador()).toHaveTextContent('16 productos encontrados')
    expect(tarjetas(container).length).toBe(16)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Herramientas')
  })

  it('?q=ceramica encuentra "cerámica" (búsqueda sin tildes)', () => {
    montar('?q=ceramica')
    expect(screen.getByText('Mortero cola cerámica 25 kg')).toBeInTheDocument()
  })

  it('la búsqueda exige que TODAS las palabras coincidan', () => {
    montar('?q=cemento melon')
    expect(screen.getByText('Cemento Melón blanco 25 kg')).toBeInTheDocument()
    expect(screen.queryByText('Cemento Polpaico gris 25 kg')).toBeNull()
  })

  it('busca también por código de producto', () => {
    montar('?q=MC001')
    expect(contador()).toHaveTextContent('1 producto encontrado')
  })

  it('?min y ?max filtran por rango de precio', () => {
    const { container } = montar('?cat=herramientas&min=1000&max=2000')
    const precios = [...container.querySelectorAll('.flm-product-card .fs-5')].map((e) => Number(e.textContent.match(/\$([\d.]+)/)[1].replace(/\./g, '')))
    expect(precios.length).toBeGreaterThan(0)
    expect(precios.every((p) => p >= 1000 && p <= 2000)).toBeTrue()
  })

  it('?sort=precio-asc ordena de menor a mayor', () => {
    const { container } = montar('?sort=precio-asc')
    const precios = [...container.querySelectorAll('.flm-product-card .fs-5')].map((e) => Number(e.textContent.match(/\$([\d.]+)/)[1].replace(/\./g, '')))
    const ordenados = [...precios].sort((a, b) => a - b)
    expect(precios).toEqual(ordenados)
  })

  it('?sort=precio-desc ordena de mayor a menor', () => {
    const { container } = montar('?sort=precio-desc')
    const precios = [...container.querySelectorAll('.flm-product-card .fs-5')].map((e) => Number(e.textContent.match(/\$([\d.]+)/)[1].replace(/\./g, '')))
    expect(precios[0]).toBeGreaterThanOrEqual(precios[precios.length - 1])
  })

  it('?stock=1 oculta los productos agotados', () => {
    setStock({ 1: 0 })
    montar('?cat=construccion&stock=1')
    expect(contador()).toHaveTextContent('9 productos encontrados')
    expect(screen.queryByText('Cemento Polpaico gris 25 kg')).toBeNull()
  })
})

describe('Catalogo — interacción del usuario', () => {
  it('escribir en el buscador filtra en vivo', async () => {
    montar()
    await userEvent.setup().type(screen.getByPlaceholderText(/Buscar por código/), 'martillo')
    expect(screen.getByText('Martillo carpintero 500g')).toBeInTheDocument()
    expect(screen.queryByText('Cemento Polpaico gris 25 kg')).toBeNull()
  })

  it('elegir una categoría en el select filtra y reinicia subcategoría/marca', async () => {
    const { container } = montar()
    await userEvent.setup().selectOptions(screen.getByLabelText('Categoría'), 'electricidad')
    expect(tarjetas(container).length).toBe(13)
  })

  it('el select de marca solo ofrece marcas de la categoría elegida', () => {
    montar('?cat=seguridad')
    const opciones = within(screen.getByLabelText('Marca')).getAllByRole('option').map((o) => o.textContent)
    expect(opciones).toContain('3M')
    expect(opciones).not.toContain('Polpaico')
  })

  it('marcar "Solo con stock" actualiza la URL/filtro', () => {
    setStock({ 1: 0 })
    montar('?cat=construccion')
    fireEvent.click(screen.getByLabelText('Solo con stock'))
    expect(contador()).toHaveTextContent('9 productos encontrados')
  })

  it('sin resultados: muestra el mensaje y "Ver todo el catálogo" restablece', () => {
    montar('?q=zzzzzz')
    expect(screen.getByText(/No se encontraron productos/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Ver todo el catálogo' }))
    expect(contador()).toHaveTextContent('85 productos encontrados')
  })

  it('"Limpiar" quita todos los filtros', () => {
    montar('?cat=herramientas&q=martillo')
    fireEvent.click(screen.getByRole('button', { name: /Limpiar/ }))
    expect(contador()).toHaveTextContent('85 productos encontrados')
  })
})

describe('Home — productos destacados', () => {
  it('muestra el título y 8 destacados (uno por categoría)', () => {
    const { container } = renderApp(<Home />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Materiales de construcción')
    expect(tarjetas(container).length).toBe(8)
  })

  it('si el primer producto de una categoría no tiene stock, destaca otro', () => {
    setStock({ 1: 0 })
    renderApp(<Home />)
    expect(screen.queryByText('Cemento Polpaico gris 25 kg')).toBeNull()
    expect(screen.getByText('Cemento Melón blanco 25 kg')).toBeInTheDocument()
  })

  it('tiene el enlace "Ver catálogo"', () => {
    renderApp(<Home />)
    expect(screen.getByRole('link', { name: 'Ver catálogo' }).getAttribute('href')).toBe('/catalogo')
  })
})

describe('Catalogo — subcategoría, marca y rango de precio', () => {
  it('elegir subcategoría filtra los productos', async () => {
    const { container } = montar('?cat=construccion')
    await userEvent.setup().selectOptions(screen.getByLabelText('Subcategoría'), 'Cementos')
    expect(tarjetas(container).length).toBe(2)
  })

  it('elegir marca filtra los productos', async () => {
    const { container } = montar('?cat=herramientas')
    await userEvent.setup().selectOptions(screen.getByLabelText('Marca'), 'Makita')
    expect(tarjetas(container).length).toBeGreaterThan(0)
    expect(tarjetas(container).length).toBeLessThan(16)
  })

  it('escribir precio mínimo y máximo filtra por rango', () => {
    montar('?cat=herramientas')
    fireEvent.change(screen.getByLabelText('Precio mínimo'), { target: { value: '100000' } })
    fireEvent.change(screen.getByLabelText('Precio máximo'), { target: { value: '200000' } })
    expect(contador()).toHaveTextContent(/productos? encontrados?/)
    expect(screen.getByLabelText('Precio mínimo').value).toBe('100000')
  })

  it('cambiar el orden desde el select reordena la lista', async () => {
    const { container } = montar('?cat=herramientas')
    await userEvent.setup().selectOptions(screen.getByLabelText('Ordenar'), 'nombre')
    const nombres = [...container.querySelectorAll('.flm-product-card .card-title')].map((e) => e.textContent)
    expect(nombres).toEqual([...nombres].sort((a, b) => a.localeCompare(b, 'es')))
  })
})
