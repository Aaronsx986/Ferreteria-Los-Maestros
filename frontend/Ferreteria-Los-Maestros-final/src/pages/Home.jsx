import { Link } from 'react-router-dom'
import { useShop } from '../context/ShopContext.jsx'
import ProductCard from '../components/ProductCard.jsx'

function Home() {
  const { products } = useShop()

  // Destacados: un producto disponible por categoría, para mostrar variedad
  const seen = new Set()
  const destacados = products
    .filter((p) => {
      if (p.stock <= 0 || seen.has(p.category)) return false
      seen.add(p.category)
      return true
    })
    .slice(0, 8)

  return (
    <main className="container">
      <section className="flm-hero">
        <h1>Materiales de construcción al mejor precio</h1>
        <p>Cemento, herramientas, pinturas y más, con despacho a todo Chile.</p>
        <Link to="/catalogo" className="btn btn-primary">Ver catálogo</Link>
      </section>

      <section>
        <h2 className="h4 fw-bold">Productos destacados</h2>
        <div className="flm-grid">
          {destacados.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </main>
  )
}

export default Home
