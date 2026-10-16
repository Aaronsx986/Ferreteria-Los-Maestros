import { Link, useLocation, useSearchParams } from 'react-router-dom'

const categories = [
  { value: 'construccion', label: 'Materiales de Construcción' },
  { value: 'pinturas', label: 'Pinturas y Recubrimientos' },
  { value: 'herramientas', label: 'Herramientas' },
  { value: 'gasfiteria', label: 'Gasfitería' },
  { value: 'electricidad', label: 'Electricidad' },
  { value: 'tornilleria', label: 'Tornillería y Fijaciones' },
  { value: 'madera', label: 'Madera y Tableros' },
  { value: 'seguridad', label: 'Seguridad y EPP' },
  { value: 'jardin', label: 'Jardín y Exterior' },
]

function Catbar() {
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const activeCat = pathname === '/catalogo' ? params.get('cat') : null

  return (
    <div className="flm-catnav">
      <div className="container flm-catnav-scroll">
        <ul className="nav flex-nowrap">
          {categories.map((c) => (
            <li className="nav-item" key={c.value}>
              <Link
                className={`nav-link${activeCat === c.value ? ' active' : ''}`}
                to={`/catalogo?cat=${c.value}`}
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Catbar
