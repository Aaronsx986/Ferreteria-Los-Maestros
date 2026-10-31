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
})

describe('ProductCard — ofertas y enlace al detalle', () => {
  it('con descuento muestra la insignia y el precio normal tachado', () => {
    const { container } = renderApp(<ProductCard product={{ ...delJson(8), listPrice: 550, price: 495, discount: 10, stock: 5 }} />)
    expect(screen.getByText('-10%')).toBeInTheDocument()
    expect(container.querySelector('s').textContent).toBe('$550')
    expect(screen.getByText(/\$495/)).toBeInTheDocument()
  })
})

describe('Ofertas', () => {
  it('lista solo los productos con descuento (13 en products.json)', () => {
    renderApp(<Ofertas />)
    expect(screen.getByText('13 productos con descuento')).toBeInTheDocument()
    expect(document.querySelectorAll('.flm-product-card').length).toBe(13)
  })
})
