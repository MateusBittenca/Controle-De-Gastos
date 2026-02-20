const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const TOKEN_KEY = 'gastos_token'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  const token = getStoredToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  const config = { ...options, headers }
  const res = await fetch(url, config)
  if (!res.ok) {
    const err = new Error(res.statusText || 'Erro na requisição')
    err.status = res.status
    try {
      err.detail = await res.json()
    } catch {
      err.detail = await res.text()
    }
    throw err
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

export { BASE_URL }
