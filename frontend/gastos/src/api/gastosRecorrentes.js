import { api } from './client'

export async function listarRecorrentes() {
  return api.get('/api/gastos-recorrentes/')
}

export async function obterRecorrente(id) {
  return api.get(`/api/gastos-recorrentes/${id}`)
}

export async function criarRecorrente(data) {
  return api.post('/api/gastos-recorrentes/', data)
}

export async function atualizarRecorrente(id, data) {
  return api.patch(`/api/gastos-recorrentes/${id}`, data)
}

export async function excluirRecorrente(id) {
  return api.delete(`/api/gastos-recorrentes/${id}`)
}

export async function gerarGastoDeRecorrente(id) {
  return api.post(`/api/gastos-recorrentes/${id}/gerar`)
}

export async function processarPendentes() {
  return api.post('/api/gastos-recorrentes/processar-pendentes')
}
