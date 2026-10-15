import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useShop } from '../context/ShopContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { norm } from '../utils.js'

const SORTS = {
  '': 'Relevancia',
  'precio-asc': 'Precio: menor a mayor',
  'precio-desc': 'Precio: mayor a menor',
  'nombre': 'Nombre (A-Z)',
}

function Catalogo() {
  const { products } = useShop()
  const [params, setParams] = useSearchParams()

  // La URL es la única fuente de verdad: así el buscador del header,
  // las categorías de la barra naranja y estos filtros siempre coinciden.
  const q = params.get('q') || ''
  const cat = params.get('cat') || ''
  const sub = params.get('sub') || ''
  const brand = params.get('brand') || ''
  const sort = params.get('sort') || ''
  const onlyStock = params.get('stock') === '1'
  const min = params.get('min') || ''
  const max = params.get('max') || ''

  // El texto se guarda local para que escribir no salte el cursor
  const [text, setText] = useState(q)
  useEffect(() => setText(q), [q])

  function setParam(changes, replace = false) {
    const next = new URLSearchParams(params)
    Object.entries(changes).forEach(([k, v]) => {
      if (v === '' || v === false || v == null) next.delete(k)
      else next.set(k, v === true ? '1' : v)
    })
    setParams(next, { replace })
  }

  const categories = useMemo(() => {
    const map = new Map()
    products.forEach((p) => map.set(p.category, p.categoryLabel))
    return [...map.entries()]
  }, [products])

  const inCat = useMemo(() => (cat ? products.filter((p) => p.category === cat) : products), [products, cat])
  const subcategories = useMemo(() => [...new Set(inCat.map((p) => p.subcategory))].sort(), [inCat])
  const brands = useMemo(() => [...new Set(inCat.map((p) => p.brand))].sort(), [inCat])

  const filtered = useMemo(() => {
    const tokens = norm(q).split(/\s+/).filter(Boolean)
    const minN = min !== '' ? Number(min) : null
    const maxN = max !== '' ? Number(max) : null

    const list = products.filter((p) => {
      if (cat && p.category !== cat) return false
      if (sub && p.subcategory !== sub) return false
      if (brand && p.brand !== brand) return false
      if (onlyStock && p.stock <= 0) return false
      if (minN !== null && p.price < minN) return false
      if (maxN !== null && p.price > maxN) return false
      if (tokens.length) {
        const haystack = norm(
          [p.name, p.code, p.brand, p.subcategory, p.categoryLabel].join(' ')
        )
        if (!tokens.every((t) => haystack.includes(t))) return false
      }
      return true
    })

    if (sort === 'precio-asc') list.sort((a, b) => a.price - b.price)
    else if (sort === 'precio-desc') list.sort((a, b) => b.price - a.price)
    else if (sort === 'nombre') list.sort((a, b) => a.name.localeCompare(b.name, 'es'))
    return list
  }, [products, q, cat, sub, brand, sort, onlyStock, min, max])

  const hasFilters = q || cat || sub || brand || sort || onlyStock || min || max
  const catLabel = categories.find(([v]) => v === cat)?.[1]

  return (
    <main className="container py-4">
      <h1 className="h3 fw-bold mb-3">
        {catLabel ? catLabel : 'Catálogo de productos'}
        {q && <span className="text-muted fw-normal fs-5"> · resultados para “{q}”</span>}
      </h1>

      <div className="flm-filters mb-3">
        <div className="row g-2">
          <div className="col-12 col-md-6 col-lg-4">
            <input
              type="search"
              className="form-control"
              placeholder="Buscar por código, nombre o marca..."
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                setParam({ q: e.target.value }, true)
              }}
            />
          </div>
          <div className="col-6 col-md-3 col-lg-2">
            <select
              className="form-select"
              value={cat}
              onChange={(e) => setParam({ cat: e.target.value, sub: '', brand: '' })}
              aria-label="Categoría"
            >
              <option value="">Todas las categorías</option>
              {categories.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-3 col-lg-2">
            <select className="form-select" value={sub} onChange={(e) => setParam({ sub: e.target.value })} aria-label="Subcategoría">
              <option value="">Subcategoría</option>
              {subcategories.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-6 col-md-3 col-lg-2">
            <select className="form-select" value={brand} onChange={(e) => setParam({ brand: e.target.value })} aria-label="Marca">
              <option value="">Marca</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="col-6 col-md-3 col-lg-2">
            <select className="form-select" value={sort} onChange={(e) => setParam({ sort: e.target.value })} aria-label="Ordenar">
              {Object.entries(SORTS).map(([v, label]) => (
                <option key={v} value={v}>{v ? label : 'Ordenar por'}</option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <input
              type="number" min="0" className="form-control" placeholder="Precio mín."
              value={min} onChange={(e) => setParam({ min: e.target.value }, true)} aria-label="Precio mínimo"
            />
          </div>
          <div className="col-6 col-md-3 col-lg-2">
            <input
              type="number" min="0" className="form-control" placeholder="Precio máx."
              value={max} onChange={(e) => setParam({ max: e.target.value }, true)} aria-label="Precio máximo"
            />
          </div>
          <div className="col-6 col-md-3 col-lg-3 d-flex align-items-center">
            <div className="form-check mb-0">
              <input
                className="form-check-input" type="checkbox" id="onlyStock"
                checked={onlyStock} onChange={(e) => setParam({ stock: e.target.checked })}
              />
              <label className="form-check-label small" htmlFor="onlyStock">Solo con stock</label>
            </div>
          </div>
          <div className="col-6 col-md-3 col-lg-2 ms-lg-auto">
            <button
              className="btn btn-outline-secondary w-100"
              disabled={!hasFilters}
              onClick={() => setParams({})}
            >
              <i className="bi bi-x-circle me-1"></i>Limpiar
            </button>
          </div>
        </div>
      </div>

      <p className="text-muted mb-0">
        {filtered.length} {filtered.length === 1 ? 'producto encontrado' : 'productos encontrados'}
      </p>

      {filtered.length > 0 ? (
        <div className="flm-grid">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted py-5">
          <i className="bi bi-search fs-1 d-block mb-2"></i>
          <p className="mb-2">No se encontraron productos con esos filtros.</p>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setParams({})}>
            Ver todo el catálogo
          </button>
        </div>
      )}
    </main>
  )
}

export default Catalogo
