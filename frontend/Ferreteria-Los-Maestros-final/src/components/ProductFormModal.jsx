import { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import FormField from './FormField.jsx'
import { CATEGORIES } from '../data/categories.js'
import { validateProduct } from '../validations.js'

const EMPTY = {
  code: '', name: '', category: '', subcategory: '', brand: '', unit: 'Unidad',
  buyPrice: '', price: '', stock: '', minStock: '5', discount: '0', imagen: '',
}

// Los inputs trabajan con texto; al editar se convierte el producto a strings
function toForm(p) {
  return {
    code: p.code, name: p.name, category: p.category, subcategory: p.subcategory || '',
    brand: p.brand, unit: p.unit || '', buyPrice: String(p.buyPrice ?? ''),
    price: String(p.listPrice ?? p.price), stock: String(p.stock), minStock: String(p.minStock ?? ''),
    discount: String(p.discount || 0), imagen: p.imagen || '',
  }
}

// product = null -> producto nuevo; product = {...} -> edición
function ProductFormModal({ product, products, onSave, onClose }) {
  const editing = Boolean(product)
  const [form, setForm] = useState(() => (editing ? toForm(product) : EMPTY))
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const found = validateProduct(form, products, editing ? product.id : null)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    onSave({
      code: form.code.trim(),
      name: form.name.trim(),
      category: form.category,
      subcategory: form.subcategory.trim(),
      brand: form.brand.trim(),
      unit: form.unit.trim(),
      buyPrice: Number(form.buyPrice),
      price: Number(form.price),
      stock: Number(form.stock),
      minStock: Number(form.minStock),
      discount: Number(form.discount) || 0,
      imagen: form.imagen.trim(),
    })
  }

  const field = (name) => ({ name, value: form[name], onChange: handleChange, error: errors[name] })

  return (
    <Modal show onHide={onClose} centered size="lg" animation={false}>
      <form onSubmit={handleSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title className="h5">{editing ? 'Editar producto' : 'Nuevo producto'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <FormField label="Código" className="col-md-4" {...field('code')} />
            <FormField label="Nombre" className="col-md-8" {...field('name')} />
            <FormField label="Categoría" as="select" className="col-md-4" {...field('category')}>
              <option value="">Selecciona...</option>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </FormField>
            <FormField label="Subcategoría" className="col-md-4" {...field('subcategory')} />
            <FormField label="Marca" className="col-md-4" {...field('brand')} />
            <FormField label="Unidad de venta" className="col-md-3" {...field('unit')} />
            <FormField label="Precio de compra" type="number" min="0" className="col-md-3" {...field('buyPrice')} />
            <FormField label="Precio de venta" type="number" min="0" className="col-md-3" {...field('price')} />
            <FormField label="Descuento (%)" type="number" min="0" max="90" className="col-md-3" {...field('discount')} />
            <FormField label="Stock" type="number" min="0" className="col-md-3" {...field('stock')} />
            <FormField label="Stock mínimo" type="number" min="0" className="col-md-3" {...field('minStock')} />
            <FormField label="Imagen (ruta o URL, opcional)" className="col-md-6" {...field('imagen')} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary">{editing ? 'Guardar cambios' : 'Crear producto'}</button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default ProductFormModal
