// PRUEBAS DE COMPONENTE — ProductCard (props, estado local, renderizado condicional, eventos)
import { screen, fireEvent, act } from '@testing-library/react'
import ProductCard from '../src/components/ProductCard.jsx'
import productsData from '../src/data/products.json'
import { renderApp, setStock } from './helpers.jsx'

const base = productsData.products.find((p) => p.id === 1) // Cemento Polpaico, $5.990, stock 80

describe('ProductCard — renderizado a partir de props', () => {
  it('muestra nombre, marca y precio formateado', () => {
    renderApp(<ProductCard product={base} />)
    expect(screen.getByText('Cemento Polpaico gris 25 kg')).toBeInTheDocument()
    expect(screen.getByText('Polpaico')).toBeInTheDocument()
    expect(screen.getByText(/\$5\.990/)).toBeInTheDocument()
  })
})

describe('ProductCard — renderizado condicional según stock', () => {
  it('stock normal: "Disponible" y botón habilitado', () => {
    renderApp(<ProductCard product={base} />)
    expect(screen.getByText('Disponible')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Agregar al carrito/ })).not.toBeDisabled()
  })
})

describe('ProductCard — estado y eventos', () => {
  it('al hacer clic agrega al carrito y muestra "¡Agregado!"', () => {
    renderApp(<ProductCard product={base} />)
    fireEvent.click(screen.getByRole('button', { name: /Agregar al carrito/ }))
    expect(screen.getByRole('button', { name: /¡Agregado!/ })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('flm_cart'))).toEqual([{ id: 1, qty: 1 }])
  })
})
