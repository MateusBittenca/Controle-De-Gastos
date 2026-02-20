import { api } from './client'

/**
 * Resumo do mês para o dashboard (totais, saldo, meta e últimos gastos).
 * @param {number} mes - Mês (0 = Janeiro, 11 = Dezembro)
 * @param {number} ano - Ano (ex: 2025)
 */
export async function getResumoMes(mes, ano) {
  return api.get(`/api/resumo/?mes=${mes}&ano=${ano}`)
}
