import { useState } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Gastos from './pages/Gastos'
import Receitas from './pages/Receitas'
import Recorrentes from './pages/Recorrentes'
import Relatorios from './pages/Relatorios'
import Configuracoes from './pages/Configuracoes'
import Usuario from './pages/Usuario'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Termos from './pages/Termos'
import Privacidade from './pages/Privacidade'
import Contato from './pages/Contato'
import ScrollToTop from './components/ScrollToTop'
import './App.css'

function AppLayout() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-layout">
      <div
        className="sidebar-backdrop"
        aria-hidden="true"
        data-visible={sidebarOpen}
        onClick={() => setSidebarOpen(false)}
      />
      <Sidebar
        user={user}
        onLogout={logout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="main-content">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="main-content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) {
    return (
      <div className="app-loading">
        <span className="app-spinner" />
        <span>Carregando...</span>
      </div>
    )
  }
  if (!token) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) {
    return (
      <div className="app-loading">
        <span className="app-spinner" />
        <span>Carregando...</span>
      </div>
    )
  }
  if (token) return <Navigate to="/app" replace />
  return children
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/cadastro" element={<PublicRoute><Cadastro /></PublicRoute>} />
      <Route path="/termos" element={<Termos />} />
      <Route path="/privacidade" element={<Privacidade />} />
      <Route path="/contato" element={<Contato />} />
      <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="gastos" element={<Gastos />} />
        <Route path="receitas" element={<Receitas />} />
        <Route path="recorrentes" element={<Recorrentes />} />
        <Route path="relatorios" element={<Relatorios />} />
        <Route path="configuracoes" element={<Configuracoes />} />
        <Route path="usuario" element={<Usuario />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}

export default App
