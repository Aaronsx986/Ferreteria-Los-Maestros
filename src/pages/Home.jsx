import { Link } from 'react-router-dom'
import products from '../data/products.js'
import ProductCard from '../components/ProductCard.jsx'

function Home() {
  const destacados = products.slice(0, 6)

  return (
    <main className="container">
      <section className="hero">
        <h1>Materiales de construcción al mejor precio</h1>
        <p>Cemento, herramientas, pinturas y más, con despacho a todo Chile.</p>
        <Link to="/catalogo" className="btn">Ver catálogo</Link>
      </section>

      <section>
        <h2>Productos destacados</h2>
        <div className="grid">
          {destacados.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </main>
  )
}

export default Home
