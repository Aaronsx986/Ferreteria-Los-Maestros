import { Link } from 'react-router-dom'
import productsData from '../data/products.json'
import ProductCard from '../components/ProductCard.jsx'

const categories = [
  { label: 'Mat. Construcción', icon: 'bi-bricks', value: 'construccion' },
  { label: 'Herramientas', icon: 'bi-tools', value: 'herramientas' },
  { label: 'Pinturas', icon: 'bi-paint-bucket', value: 'pinturas' },
  { label: 'Gasfitería', icon: 'bi-droplet-half', value: 'gasfiteria' },
  { label: 'Electricidad', icon: 'bi-lightning-charge', value: 'electricidad' },
  { label: 'Tornillería', icon: 'bi-nut', value: 'tornilleria' },
  { label: 'Madera', icon: 'bi-tree', value: 'madera' },
  { label: 'Seguridad', icon: 'bi-shield-check', value: 'seguridad' },
]

function Home() {
  const destacados = productsData.products.slice(0, 8)

  return (
    <>
      <section className="text-white py-5" style={{ background: 'linear-gradient(120deg, var(--flm-dark), #343a40)' }}>
        <div className="container text-center">
          <h1 className="fw-bold display-5">Todo para tu obra, arreglo o proyecto</h1>
          <p className="lead">Materiales de construcción, herramientas y más, al mejor precio.</p>
          <Link to="/catalogo" className="btn btn-lg text-white" style={{ background: 'var(--flm-orange)' }}>
            Ver catálogo completo
          </Link>
        </div>
      </section>

      <section className="container py-5">
        <h2 className="mb-4">Categorías</h2>
        <div className="row g-3">
          {categories.map((c) => (
            <div className="col-6 col-md-3" key={c.value}>
              <Link to={`/catalogo?cat=${c.value}`} className="card text-center text-decoration-none text-dark h-100 py-3">
                <i className={`bi ${c.icon} fs-2`} style={{ color: 'var(--flm-orange)' }}></i>
                <span className="small fw-semibold mt-2">{c.label}</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="container pb-5">
        <h2 className="mb-4">Productos destacados</h2>
        <div className="row g-3">
          {destacados.map((p) => (
            <div className="col-6 col-md-4 col-lg-3" key={p.id}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default Home
