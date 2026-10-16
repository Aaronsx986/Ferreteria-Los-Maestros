import { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import FormField from './FormField.jsx'
import { validateUser } from '../validations.js'

const EMPTY = { name: '', username: '', email: '', phone: '', password: '', role: 'user', status: 'active' }

// user = null -> usuario nuevo; user = {...} -> edición. "isSelf" bloquea rol y estado del admin logueado.
function UserFormModal({ user, users, isSelf = false, onSave, onClose }) {
  const editing = Boolean(user)
  const [form, setForm] = useState(() =>
    editing
      ? { name: user.name, username: user.username, email: user.email, phone: user.phone || '', password: '', role: user.role, status: user.status || 'active' }
      : EMPTY
  )
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const found = validateUser(form, users, editing ? user.username : null)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    onSave({ ...form, name: form.name.trim(), username: form.username.trim(), email: form.email.trim(), phone: form.phone.trim() })
  }

  const field = (name) => ({ name, value: form[name], onChange: handleChange, error: errors[name] })

  return (
    <Modal show onHide={onClose} centered animation={false}>
      <form onSubmit={handleSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title className="h5">{editing ? 'Editar usuario' : 'Nuevo usuario'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormField label="Nombre completo" {...field('name')} />
          <div className="row">
            <FormField label="Usuario" className="col-md-6" disabled={editing} {...field('username')} />
            <FormField label="Correo electrónico" type="email" className="col-md-6" {...field('email')} />
          </div>
          <FormField label="Teléfono" {...field('phone')} />
          <FormField
            label={editing ? 'Contraseña (vacío = no cambiar)' : 'Contraseña'}
            type="password"
            autoComplete="new-password"
            {...field('password')}
          />
          <div className="row">
            <FormField label="Rol" as="select" className="col-md-6" disabled={isSelf} {...field('role')}>
              <option value="user">Cliente</option>
              <option value="admin">Administrador</option>
            </FormField>
            <FormField label="Estado" as="select" className="col-md-6" disabled={isSelf} {...field('status')}>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </FormField>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary">{editing ? 'Guardar cambios' : 'Crear usuario'}</button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default UserFormModal
