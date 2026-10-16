// Campo de formulario reutilizable: etiqueta + control + mensaje de error.
// Con as="select" los <option> se pasan como children.
function FormField({ label, name, error, as = 'input', className = '', children, ...rest }) {
  const id = `field-${name}`
  const Control = as
  const base = as === 'select' ? 'form-select' : 'form-control'
  return (
    <div className={`mb-3 ${className}`}>
      <label htmlFor={id} className="form-label small fw-semibold">{label}</label>
      <Control id={id} name={name} className={`${base}${error ? ' is-invalid' : ''}`} {...rest}>
        {children}
      </Control>
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  )
}

export default FormField
