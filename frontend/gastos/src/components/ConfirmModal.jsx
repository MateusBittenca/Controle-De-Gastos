import { useEffect } from 'react'
import './ConfirmModal.css'

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return
    function onEscape(e) {
      if (e.key === 'Escape' && !loading) onCancel?.()
    }
    document.addEventListener('keydown', onEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onEscape)
      document.body.style.overflow = ''
    }
  }, [open, loading, onCancel])

  if (!open) return null

  return (
    <div
      className="confirm-modal-overlay"
      onClick={loading ? undefined : onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h2 id="confirm-modal-title" className="confirm-modal-title">
          {title}
        </h2>
        <p className="confirm-modal-message">{message}</p>
        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-modal-btn confirm-modal-btn-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`confirm-modal-btn confirm-modal-btn-confirm confirm-modal-btn-${variant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Excluindo...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
