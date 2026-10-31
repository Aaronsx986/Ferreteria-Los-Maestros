import { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import FormField from './FormField.jsx'
import { validateSupplier } from '../validations.js'

const EMPTY = {
  name: '', contactName: '', contactEmail: '', contactPhone: '',
  paymentTerms: '30 días', deliveryTime: '', rating: '4', status: 'active',
}

// supplier = null -> proveedor nuevo; supplier = {...} -> edición
function SupplierFormModal({ supplier, suppliers, onSave, onClose }) {
  const editing = Boolean(supplier)
  const [form, setForm] = useState(() =>
    editing
      ? {
          name: supplier.name, contactName: supplier.contact.name, contactEmail: supplier.contact.email,
          contactPhone: supplier.contact.phone || '', paymentTerms: supplier.paymentTerms,
          deliveryTime: supplier.deliveryTime, rating: String(supplier.rating), status: supplier.status,
        }
      : EMPTY
  )
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const found = validateSupplier(form, suppliers, editing ? supplier.id : null)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    onSave({
      name: form.name.trim(),
      contact: {
        ...(supplier?.contact || { position: '' }),
        name: form.contactName.trim(),
        email: form.contactEmail.trim(),
        phone: form.contactPhone.trim(),
      },
      paymentTerms: form.paymentTerms.trim(),
      deliveryTime: form.deliveryTime.trim(),
      rating: Number(form.rating),
      status: form.status,
    })
  }

  const field = (name) => ({ name, value: form[name], onChange: handleChange, error: errors[name] })

  return (
    <Modal show onHide={onClose} centered animation={false}>
      <form onSubmit={handleSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title className="h5">{editing ? 'Editar proveedor' : 'Nuevo proveedor'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormField label="Nombre del proveedor" {...field('name')} />
          <div className="row">
            <FormField label="Contacto" className="col-md-6" {...field('contactName')} />
            <FormField label="Correo del contacto" type="email" className="col-md-6" {...field('contactEmail')} />
          </div>
          <FormField label="Teléfono del contacto" {...field('contactPhone')} />
          <div className="row">
            <FormField label="Condiciones de pago" className="col-md-6" {...field('paymentTerms')} />
            <FormField label="Plazo de entrega" className="col-md-6" placeholder="2-4 días hábiles" {...field('deliveryTime')} />
          </div>
          <div className="row">
            <FormField label="Evaluación (0 a 5)" type="number" min="0" max="5" step="0.1" className="col-md-6" {...field('rating')} />
            <FormField label="Estado" as="select" className="col-md-6" {...field('status')}>
              <option value="active">Activo</option>
              <option value="pending">Pendiente</option>
            </FormField>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary">{editing ? 'Guardar cambios' : 'Crear proveedor'}</button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default SupplierFormModal
