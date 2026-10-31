// Categorías del catálogo (mismos valores que usa products.json en "category")
export const CATEGORIES = [
  { value: 'construccion', label: 'Mat. Construcción' },
  { value: 'pinturas', label: 'Pinturas' },
  { value: 'herramientas', label: 'Herramientas' },
  { value: 'gasfiteria', label: 'Gasfitería' },
  { value: 'electricidad', label: 'Electricidad' },
  { value: 'tornilleria', label: 'Tornillería' },
  { value: 'madera', label: 'Madera' },
  { value: 'seguridad', label: 'Seguridad' },
  { value: 'jardin', label: 'Jardín' },
]

export const categoryLabel = (value) =>
  CATEGORIES.find((c) => c.value === value)?.label || value
