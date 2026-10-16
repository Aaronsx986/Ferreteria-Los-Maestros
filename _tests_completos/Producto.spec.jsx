// PRUEBAS DE COMPONENTE — Detalle de producto y Ofertas
import { screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import DetalleProducto from '../src/pages/DetalleProducto.jsx'
import Ofertas from '../src/pages/Ofertas.jsx'
import ProductCard from '../src/components/ProductCard.jsx'
import productsData from '../src/data/products.json'
import { renderApp, setStock } from './helpers.jsx'

const montarDetalle = (id) =>
  renderApp(
    <Routes><Route path="/producto/:id" element={<DetalleProducto />} /></Routes>,
    { route: `/producto/${id}` }
  )
const delJson = (id) => productsData.products.find((p) => p.id === id)

describe('DetalleProducto', () => {
  it('muestra nombre, código, precio, stock y ficha técnica', () => {
    montarDetalle(1)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Cemento Polpaico gris 25 kg')
    expect(screen.getByText('Código: MC001')).toBeInTheDocument()
    expect(screen.getByText(/\$5\.990/)).toBeInTheDocument()
    expect(screen.getByText(/80 en stock/)).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Cementos' })).toBeInTheDocument()
  })

  it('el breadcrumb enlaza al catálogo de su categoría', () => {
    montarDetalle(1)
    const enlace = screen.getByRole('link', { name: 'Mat. Construcción' })
    expect(enlace.getAttribute('href')).toBe('/catalogo?cat=construccion')
  })

  it('un producto en oferta muestra el precio normal tachado y el descuento aplicado', () => {
    montarDetalle(8) // Ladrillo prensado: $550 con 10 % de descuento
    expect(screen.getAllByText('-10%').length).toBeGreaterThan(0)
    expect(screen.getAllByText('$550')[0].tagName).toBe('S')
    expect(screen.getByText(/\$495/)).toBeInTheDocument()
  })

  it('agrega al carrito la cantidad elegida', async () => {
    montarDetalle(1)
    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '3' } })
    await userEvent.setup().click(screen.getAllByRole('button', { name: /Agregar al carrito/ })[0])
    expect(JSON.parse(localStorage.getItem('flm_cart'))).toEqual([{ id: 1, qty: 3 }])
    expect(screen.getByText(/Producto agregado/)).toBeInTheDocument()
  })

  it('no deja elegir más unidades que el stock', () => {
    setStock({ 1: 2 })
    montarDetalle(1)
    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '9' } })
    expect(screen.getByLabelText('Cantidad').value).toBe('2')
  })

  it('sin stock muestra "No disponible" y deshabilita el botón', () => {
    setStock({ 1: 0 })
    montarDetalle(1)
    expect(screen.getByText('No disponible')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Agregar al carrito/ })[0]).toBeDisabled()
  })

  it('sugiere hasta 4 productos relacionados de la misma categoría', () => {
    montarDetalle(1)
    expect(screen.getByText('Productos relacionados')).toBeInTheDocument()
    expect(document.querySelectorAll('.flm-product-card').length).toBe(4)
  })

  it('un id inexistente muestra "Producto no encontrado"', () => {
    montarDetalle(99999)
    expect(screen.getByText('Producto no encontrado')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al catálogo' }).getAttribute('href')).toBe('/catalogo')
  })
})

describe('ProductCard — ofertas y enlace al detalle', () => {
  it('con descuento muestra la insignia y el precio normal tachado', () => {
    const { container } = renderApp(<ProductCard product={{ ...delJson(8), listPrice: 550, price: 495, discount: 10, stock: 5 }} />)
    expect(screen.getByText('-10%')).toBeInTheDocument()
    expect(container.querySelector('s').textContent).toBe('$550')
    expect(screen.getByText(/\$495/)).toBeInTheDocument()
  })

  it('sin descuento no muestra insignia ni precio tachado', () => {
    const { container } = renderApp(<ProductCard product={{ ...delJson(1), listPrice: 5990 }} />)
    expect(container.querySelector('.flm-offer-badge')).toBeNull()
    expect(container.querySelector('s')).toBeNull()
  })

  it('el nombre del producto enlaza a su detalle', () => {
    renderApp(<ProductCard product={delJson(1)} />)
    expect(screen.getByRole('link', { name: 'Cemento Polpaico gris 25 kg' }).getAttribute('href')).toBe('/producto/1')
  })
})

describe('Ofertas', () => {
  it('lista solo los productos con descuento (13 en products.json)', () => {
    renderApp(<Ofertas />)
    expect(screen.getByText('13 productos con descuento')).toBeInTheDocument()
    expect(document.querySelectorAll('.flm-product-card').length).toBe(13)
  })

  it('ordena de mayor a menor descuento', () => {
    renderApp(<Ofertas />)
    const insignias = [...document.querySelectorAll('.flm-offer-badge')].map((b) => Number(b.textContent.replace(/\D/g, '')))
    expect(insignias[0]).toBe(30)
    expect(insignias).toEqual([...insignias].sort((a, b) => b - a))
  })

  it('cada tarjeta trae el precio con el descuento ya aplicado', () => {
    renderApp(<Ofertas />)
    const tarjeta = screen.getByText('Disyuntor termomagnético 25A unipolar').closest('.flm-product-card')
    expect(within(tarjeta).getByText('-30%')).toBeInTheDocument()
    expect(within(tarjeta).getByText(/\$4\.893/)).toBeInTheDocument() // 6.990 − 30 %
  })

  it('si no hay ofertas muestra el mensaje vacío', () => {
    // Catálogo guardado sin ningún descuento
    localStorage.setItem('flm_catalog', JSON.stringify([delJson(1)]))
    renderApp(<Ofertas />)
    expect(screen.getByText('Por ahora no hay productos en oferta.')).toBeInTheDocument()
  })
})
