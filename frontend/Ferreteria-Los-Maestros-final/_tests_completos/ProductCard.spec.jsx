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

  it('muestra la imagen con su texto alternativo', () => {
    renderApp(<ProductCard product={base} />)
    expect(screen.getByAltText('Cemento Polpaico gris 25 kg')).toBeInTheDocument()
  })

  it('se personaliza con otro producto (mismo componente, otras props)', () => {
    const otro = productsData.products.find((p) => p.id === 20)
    renderApp(<ProductCard product={otro} />)
    expect(screen.getByText('Martillo carpintero 500g')).toBeInTheDocument()
    expect(screen.queryByText('Cemento Polpaico gris 25 kg')).toBeNull()
  })
})

describe('ProductCard — renderizado condicional según stock', () => {
  it('stock normal: "Disponible" y botón habilitado', () => {
    renderApp(<ProductCard product={base} />)
    expect(screen.getByText('Disponible')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Agregar al carrito/ })).not.toBeDisabled()
  })

  it('stock bajo (≤3): muestra "¡Últimas unidades!"', () => {
    setStock({ 1: 3 })
    renderApp(<ProductCard product={{ ...base, stock: 3 }} />)
    expect(screen.getByText(/¡Últimas unidades! \(3\)/)).toBeInTheDocument()
  })

  it('sin stock: "No disponible" y botón "Sin stock" deshabilitado', () => {
    setStock({ 1: 0 })
    renderApp(<ProductCard product={{ ...base, stock: 0 }} />)
    expect(screen.getByText('No disponible')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sin stock' })).toBeDisabled()
  })
})

describe('ProductCard — estado y eventos', () => {
  it('al hacer clic agrega al carrito y muestra "¡Agregado!"', () => {
    renderApp(<ProductCard product={base} />)
    fireEvent.click(screen.getByRole('button', { name: /Agregar al carrito/ }))
    expect(screen.getByRole('button', { name: /¡Agregado!/ })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('flm_cart'))).toEqual([{ id: 1, qty: 1 }])
  })

  it('el mensaje "¡Agregado!" desaparece solo a los 1,2 s (reloj simulado)', () => {
    jasmine.clock().install() // MOCK del tiempo: no esperamos 1,2 segundos reales
    try {
      renderApp(<ProductCard product={base} />)
      fireEvent.click(screen.getByRole('button', { name: /Agregar al carrito/ }))
      expect(screen.getByRole('button', { name: /¡Agregado!/ })).toBeInTheDocument()
      act(() => { jasmine.clock().tick(1300) })
      expect(screen.getByRole('button', { name: /Agregar al carrito/ })).toBeInTheDocument()
    } finally {
      jasmine.clock().uninstall()
    }
  })

  it('al llegar al stock máximo el botón queda "Máximo en carrito" y deshabilitado', () => {
    setStock({ 1: 1 })
    jasmine.clock().install()
    try {
      renderApp(<ProductCard product={{ ...base, stock: 1 }} />)
      fireEvent.click(screen.getByRole('button', { name: /Agregar al carrito/ }))
      act(() => { jasmine.clock().tick(1300) }) // pasa el aviso temporal "¡Agregado!"
      expect(screen.getByRole('button', { name: 'Máximo en carrito' })).toBeDisabled()
    } finally {
      jasmine.clock().uninstall()
    }
  })

  it('si la imagen falla al cargar, muestra el ícono de respaldo', () => {
    const { container } = renderApp(<ProductCard product={base} />)
    fireEvent.error(screen.getByAltText('Cemento Polpaico gris 25 kg'))
    expect(container.querySelector('.flm-product-img-fallback')).toBeInTheDocument()
    expect(screen.queryByAltText('Cemento Polpaico gris 25 kg')).toBeNull()
  })

  it('si el producto no trae imagen, usa el ícono de respaldo desde el inicio', () => {
    const { container } = renderApp(<ProductCard product={{ ...base, imagen: '' }} />)
    expect(container.querySelector('.flm-product-img-fallback')).toBeInTheDocument()
  })
})
