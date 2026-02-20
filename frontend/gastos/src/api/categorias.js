import { api } from './client'

export async function listarCategorias() {
  return api.get('/api/categorias/')
}

export async function obterCategoria(id) {
  return api.get(`/api/categorias/${id}`)
}

export async function criarCategoria(categoria) {
  return api.post('/api/categorias/', categoria)
}

export async function atualizarCategoria(id, categoria) {
  return api.patch(`/api/categorias/${id}`, categoria)
}

export async function excluirCategoria(id) {
  return api.delete(`/api/categorias/${id}`)
}
