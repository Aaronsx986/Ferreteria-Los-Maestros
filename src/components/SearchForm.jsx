// Formulario de búsqueda reutilizado en escritorio y móvil
function SearchForm({ value, onChange, onSubmit, className = '', placeholder }) {
  return (
    <form className={`flm-search-form ${className}`} onSubmit={onSubmit} role="search">
      <input
        type="search"
        className="form-control"
        name="q"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Buscar productos"
      />
      <button className="btn flm-search-btn" type="submit" aria-label="Buscar">
        <i className="bi bi-search"></i>
      </button>
    </form>
  )
}

export default SearchForm
