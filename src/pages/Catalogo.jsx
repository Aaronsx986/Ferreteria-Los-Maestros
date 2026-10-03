import products from '../data/products.js'
import ProductCard from '../components/ProductCard.jsx'

function Catalogo() {
  return (
    <main className="container">
      <h1>Catálogo de productos</h1>
      <div className="grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </main>
  )
}

export default Catalogo
