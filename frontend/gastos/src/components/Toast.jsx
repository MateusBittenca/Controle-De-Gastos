import { useToast } from '../context/ToastContext'
import './Toast.css'

export default function ToastContainer() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type}`}
          onClick={() => dismiss(t.id)}
        >
          <span className="toast-icon">
            {t.type === 'success' && '✓'}
            {t.type === 'error' && '!'}
            {t.type === 'info' && 'i'}
          </span>
          <span className="toast-message">{t.message}</span>
        </div>
      ))}
    </div>
  )
}
