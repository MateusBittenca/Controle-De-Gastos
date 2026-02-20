import { api } from './client'

export async function login(email, senha) {
  return api.post('/api/auth/login', { email, senha })
}

export async function registro(nome, email, senha) {
  return api.post('/api/auth/registro', { nome, email, senha })
}

export async function getMe() {
  return api.get('/api/auth/me')
}

export async function updateMe(payload) {
  return api.patch('/api/auth/me', payload)
}
