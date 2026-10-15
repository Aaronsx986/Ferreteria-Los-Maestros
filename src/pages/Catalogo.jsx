import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import productsData from '../data/products.json'
import ProductCard from '../components/ProductCard.jsx'

function Catalogo() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') || '')
  const [cat, setCat] = useState(params.get('cat') || '')

  const categories = useMemo(
    () => [...new Set(productsData.products.map((p) => p.category))],
    []
  )

  const filtered = productsData.products.filter((p) => {
    const matchesQ = q ? p.name.toLowerCase().includes(q.toLowerCase()) : true
    const matchesCat = cat ? p.category === cat : true
    return matchesQ && matchesCat
  })

  function applyFilters(newQ, newCat) {
    setQ(newQ)
    setCat(newCat)
    const next = {}
    if (newQ) next.q = newQ
    if (newCat) next.cat = newCat
    setParams(next)
  }

  return (
    <div className="container py-4">
      <h1 className="h3 mb-4">Catálogo de productos</h1>

      <div className="row mb-4 g-2">
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Buscar por código o nombre..."
            value={q}
            onChange={(e) => applyFilters(e.target.value, cat)}
          />
        </div>
        <div className="col-md-4">
          <select className="form-select" value={cat} onChange={(e) => applyFilters(q, e.target.value)}>
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <button className="btn btn-outline-secondary w-100" onClick={() => applyFilters('', '')}>
            Limpiar
          </button>
        </div>
      </div>

      <p className="text-muted">{filtered.length} productos encontrados</p>

      <div className="row g-3">
        {filtered.map((p) => (
          <div className="col-6 col-md-4 col-lg-3" key={p.id}>
            <ProductCard product={p} />
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted py-5">No se encontraron productos.</p>
        )}
      </div>
    </div>
  )
}

export default Catalogo
