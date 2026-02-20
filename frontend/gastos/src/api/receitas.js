import { api } from './client'

export async function listarReceitas() {
  return api.get('/api/receitas/')
}

export async function criarReceita(receita) {
  return api.post('/api/receitas/', receita)
}

export async function atualizarReceita(id, receita) {
  return api.patch(`/api/receitas/${id}`, receita)
}

export async function excluirReceita(id) {
  return api.delete(`/api/receitas/${id}`)
}
