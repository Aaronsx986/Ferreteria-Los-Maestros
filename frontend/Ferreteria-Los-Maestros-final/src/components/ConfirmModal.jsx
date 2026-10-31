import Modal from 'react-bootstrap/Modal'

// Ventana de confirmación para acciones destructivas (eliminar)
function ConfirmModal({ title, message, confirmLabel = 'Eliminar', onConfirm, onCancel }) {
  return (
    <Modal show onHide={onCancel} centered animation={false}>
      <Modal.Header closeButton>
        <Modal.Title className="h5">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>Cancelar</button>
        <button type="button" className="btn btn-danger" onClick={onConfirm}>{confirmLabel}</button>
      </Modal.Footer>
    </Modal>
  )
}

export default ConfirmModal
