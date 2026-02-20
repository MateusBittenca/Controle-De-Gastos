export function formatarMoeda(valor) {
  if (valor == null) return 'R$ 0,00'
  const num = typeof valor === 'string' ? parseFloat(valor) : Number(valor)
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num)
}

export function formatarData(dataStr) {
  if (!dataStr) return ''
  const d = new Date(dataStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR')
}

/** Converte dd/mm/yyyy ou Date para YYYY-MM-DD (API) */
export function dataParaAPI(valor) {
  if (!valor) return ''
  if (typeof valor === 'string' && valor.includes('-')) return valor
  if (typeof valor === 'string') {
    const [d, m, a] = valor.split('/')
    return `${a}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  const d = valor instanceof Date ? valor : new Date(valor)
  return d.toISOString().slice(0, 10)
}
