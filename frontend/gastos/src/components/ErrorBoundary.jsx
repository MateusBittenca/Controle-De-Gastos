import { Component } from 'react'
import './ErrorBoundary.css'

/**
 * Error Boundary para capturar erros de renderização no React
 * e exibir uma tela amigável em vez de tela branca.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary-card">
            <h1 className="error-boundary-title">Algo deu errado</h1>
            <p className="error-boundary-text">
              Ocorreu um erro inesperado. Tente recarregar a página ou voltar ao início.
            </p>
            <div className="error-boundary-actions">
              <button
                type="button"
                className="error-boundary-btn"
                onClick={() => window.location.reload()}
              >
                Recarregar página
              </button>
              <a href="/" className="error-boundary-link">
                Ir para o início
              </a>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
