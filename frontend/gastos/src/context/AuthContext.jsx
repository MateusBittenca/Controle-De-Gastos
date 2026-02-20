import { createContext, useContext, useState, useEffect } from 'react'
import { getStoredToken, setStoredToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setTokenState] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = getStoredToken()
    const u = localStorage.getItem('gastos_user')
    if (t && u) {
      try {
        setTokenState(t)
        setUser(JSON.parse(u))
      } catch {
        setStoredToken(null)
        localStorage.removeItem('gastos_user')
      }
    }
    setLoading(false)
  }, [])

  function login(token, userData) {
    setStoredToken(token)
    setTokenState(token)
    setUser(userData)
    localStorage.setItem('gastos_user', JSON.stringify(userData))
  }

  function logout() {
    setStoredToken(null)
    setTokenState(null)
    setUser(null)
    localStorage.removeItem('gastos_user')
  }

  function updateUser(partial) {
    if (!user) return
    const next = { ...user, ...partial }
    setUser(next)
    localStorage.setItem('gastos_user', JSON.stringify(next))
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
