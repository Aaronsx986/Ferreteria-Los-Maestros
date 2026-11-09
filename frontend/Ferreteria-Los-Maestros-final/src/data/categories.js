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

const strip = (t = '') =>
  String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

const ALIASES = {
  construccion: ['materiales de construccion', 'mat. construccion'],
  pinturas: ['pinturas y recubrimientos'],
  tornilleria: ['tornilleria y fijaciones'],
  madera: ['madera y tableros'],
  seguridad: ['seguridad y epp'],
  jardin: ['jardin y exterior'],
}

export function normalizeCategory(raw) {
  const k = strip(raw)
  if (!k) return ''
  for (const c of CATEGORIES) {
    if (k === strip(c.value) || k === strip(c.label) || (ALIASES[c.value] || []).includes(k)) {
      return c.value
    }
  }
  return k
}
