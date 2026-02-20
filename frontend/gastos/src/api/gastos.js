import { api } from './client'

export async function listarGastos() {
  return api.get('/api/gastos/')
}

export async function obterGasto(id) {
  return api.get(`/api/gastos/${id}`)
}

export async function criarGasto(gasto) {
  return api.post('/api/gastos/', gasto)
}

export async function atualizarGasto(id, gasto) {
  return api.patch(`/api/gastos/${id}`, gasto)
}

export async function excluirGasto(id) {
  return api.delete(`/api/gastos/${id}`)
}
