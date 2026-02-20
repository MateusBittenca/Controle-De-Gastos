import { useEffect, useState } from 'react'
import { listarGastos } from '../api/gastos'
import { listarReceitas } from '../api/receitas'
import { formatarMoeda } from '../utils/format'
import EmptyState from '../components/EmptyState'
import './Relatorios.css'

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function Relatorios() {
  const [gastos, setGastos] = useState([])
  const [receitas, setReceitas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    Promise.all([listarGastos(), listarReceitas()])
      .then(([g, r]) => {
        setGastos(g)
        setReceitas(r)
      })
      .catch((e) => setErro(e.message || 'Erro ao carregar.'))
      .finally(() => setCarregando(false))
  }, [])

  const porCategoria = gastos.reduce((acc, g) => {
    const nome = g.categoria_nome || 'Sem categoria'
    if (!acc[nome]) acc[nome] = 0
    acc[nome] += Number(g.valor)
    return acc
  }, {})
  const listaCategoria = Object.entries(porCategoria).sort((a, b) => b[1] - a[1])
  const maxCategoria = Math.max(...listaCategoria.map(([, v]) => v), 1)

  const agora = new Date()
  const ultimos6Meses = []
  for (let i = 0; i < 6; i++) {
    const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1)
    ultimos6Meses.push({ ano: d.getFullYear(), mes: d.getMonth(), label: `${MESES[d.getMonth()]}/${d.getFullYear()}` })
  }
  const porMes = ultimos6Meses.map(({ ano, mes }) => {
    const totalGastos = gastos
      .filter((g) => {
        const d = new Date(g.data + 'T12:00:00')
        return d.getFullYear() === ano && d.getMonth() === mes
      })
      .reduce((s, g) => s + Number(g.valor), 0)
    const totalReceitas = receitas
      .filter((r) => {
        const d = new Date(r.data + 'T12:00:00')
        return d.getFullYear() === ano && d.getMonth() === mes
      })
      .reduce((s, r) => s + Number(r.valor), 0)
    return { label: `${MESES[mes]}/${ano}`, totalGastos, totalReceitas }
  }).reverse()

  const maxMes = Math.max(1, ...porMes.map((m) => m.totalGastos + m.totalReceitas))

  const saldoPorMes = porMes.map((m) => ({
    label: m.label,
    saldo: m.totalReceitas - m.totalGastos,
  }))
  const maxSaldoAbs = Math.max(1, ...saldoPorMes.map((m) => Math.abs(m.saldo)))

  const top5Gastos = [...gastos]
    .sort((a, b) => Number(b.valor) - Number(a.valor))
    .slice(0, 5)
  const totalTop5 = top5Gastos.reduce((s, g) => s + Number(g.valor), 0)
  const coresPizza = ['#c0392b', '#2c3e50', '#3498db', '#27ae60', '#8e44ad']
  const pizzaGradient = top5Gastos.length > 0 && totalTop5 > 0
    ? top5Gastos
        .map((g, i) => {
          const pct = (Number(g.valor) / totalTop5) * 100
          const start = top5Gastos
            .slice(0, i)
            .reduce((s, x) => s + (Number(x.valor) / totalTop5) * 100, 0)
          return `${coresPizza[i % coresPizza.length]} ${start}% ${start + pct}%`
        })
        .join(', ')
    : ''

  function exportarCSV() {
    const linhas = ['Tipo;Data;Descrição;Valor;Categoria']
    gastos.forEach((g) => {
      linhas.push(`Gasto;${g.data};${(g.descricao || '').replace(/;/g, ',')};${g.valor};${(g.categoria_nome || '').replace(/;/g, ',')}`)
    })
    receitas.forEach((r) => {
      linhas.push(`Receita;${r.data};${(r.descricao || '').replace(/;/g, ',')};${r.valor};`)
    })
    const csv = '\uFEFF' + linhas.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-gastos-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (carregando) {
    return (
      <div className="relatorios">
        <header className="page-header"><h1>Relatórios</h1><p>Análise e histórico</p></header>
        <div className="relatorios-loading">
          <span className="app-spinner" />
          <span>Carregando...</span>
        </div>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="relatorios">
        <header className="page-header"><h1>Relatórios</h1><p>Análise e histórico</p></header>
        <div className="card card-erro"><p className="card-text">{erro}</p></div>
      </div>
    )
  }

  return (
    <div className="relatorios">
      <header className="page-header relatorios-header">
        <div>
          <h1>Relatórios</h1>
          <p>Análise por categoria e por mês</p>
        </div>
        <button type="button" className="relatorios-btn-export" onClick={exportarCSV}>
          Exportar CSV
        </button>
      </header>

      <div className="relatorios-grid">
        <div className="card">
          <div className="card-title">Gastos por categoria</div>
          {listaCategoria.length === 0 ? (
            <EmptyState
              icon="chart"
              title="Sem dados para análise"
              description="Adicione gastos para visualizar a distribuição por categoria."
            />
          ) : (
            <div className="relatorios-chart">
              {listaCategoria.map(([nome, valor]) => (
                <div key={nome} className="relatorios-chart-row">
                  <div className="relatorios-chart-label">
                    <span className="relatorios-chart-nome">{nome}</span>
                    <span className="relatorios-chart-valor">{formatarMoeda(valor)}</span>
                  </div>
                  <div className="relatorios-chart-bar-wrap">
                    <div
                      className="relatorios-chart-bar relatorios-chart-bar-gasto"
                      style={{ width: `${(valor / maxCategoria) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Gastos e receitas por mês (últimos 6)</div>
          {porMes.every((m) => m.totalGastos === 0 && m.totalReceitas === 0) ? (
            <p className="card-text">Nenhum lançamento no período.</p>
          ) : (
            <div className="relatorios-chart relatorios-chart-mes">
              {porMes.map(({ label, totalGastos, totalReceitas }) => (
                <div key={label} className="relatorios-chart-row relatorios-chart-row-mes">
                  <span className="relatorios-chart-mes-label">{label}</span>
                  <div className="relatorios-chart-bars">
                    <div className="relatorios-chart-bar-wrap relatorios-chart-bar-wrap-inline">
                      <div
                        className="relatorios-chart-bar relatorios-chart-bar-gasto"
                        style={{ width: `${(totalGastos / maxMes) * 100}%` }}
                        title={formatarMoeda(totalGastos)}
                      />
                    </div>
                    <div className="relatorios-chart-bar-wrap relatorios-chart-bar-wrap-inline">
                      <div
                        className="relatorios-chart-bar relatorios-chart-bar-receita"
                        style={{ width: `${(totalReceitas / maxMes) * 100}%` }}
                        title={formatarMoeda(totalReceitas)}
                      />
                    </div>
                  </div>
                  <span className="relatorios-chart-mes-valores">
                    <span className="relatorios-valor-gasto">{formatarMoeda(totalGastos)}</span>
                    <span className="relatorios-valor-receita">{formatarMoeda(totalReceitas)}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="relatorios-legenda">
            <span className="relatorios-legenda-item"><i className="relatorios-legenda-cor relatorios-legenda-gasto" /> Gastos</span>
            <span className="relatorios-legenda-item"><i className="relatorios-legenda-cor relatorios-legenda-receita" /> Receitas</span>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Saldo por mês (últimos 6)</div>
          {saldoPorMes.every((m) => m.saldo === 0) ? (
            <p className="card-text">Nenhum lançamento no período.</p>
          ) : (
            <div className="relatorios-colunas">
              {saldoPorMes.map(({ label, saldo }) => {
                const fracPos = saldo >= 0 ? Math.min(1, saldo / maxSaldoAbs) : 0
                const fracNeg = saldo < 0 ? Math.min(1, Math.abs(saldo) / maxSaldoAbs) : 0
                return (
                  <div key={label} className="relatorios-coluna-mes">
                    <div className="relatorios-coluna-bars">
                      <div className="relatorios-coluna-top">
                        <div className="relatorios-coluna-bar relatorios-coluna-bar-pos" style={{ height: `${fracPos * 100}%` }} />
                      </div>
                      <div className="relatorios-coluna-zero" />
                      <div className="relatorios-coluna-bottom">
                        <div className="relatorios-coluna-bar relatorios-coluna-bar-neg" style={{ height: `${fracNeg * 100}%` }} />
                      </div>
                    </div>
                    <span className="relatorios-coluna-label">{label}</span>
                    <span className={`relatorios-coluna-valor ${saldo >= 0 ? 'relatorios-valor-receita' : 'relatorios-valor-gasto'}`}>
                      {formatarMoeda(saldo)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
          <p className="relatorios-chart-dica">Saldo = Receitas − Gastos no mês</p>
        </div>

        <div className="card">
          <div className="card-title">Top 5 maiores gastos</div>
          {top5Gastos.length === 0 ? (
            <EmptyState
              icon="money"
              title="Nenhum gasto registrado"
              description="Os maiores gastos aparecerão aqui após você começar a registrar."
            />
          ) : (
            <div className="relatorios-pizza-wrap">
              <div
                className="relatorios-pizza"
                style={{ background: `conic-gradient(${pizzaGradient})` }}
                aria-hidden
              />
              <ul className="relatorios-pizza-legenda">
                {top5Gastos.map((g, i) => (
                  <li key={g.id} className="relatorios-pizza-legenda-item">
                    <span className="relatorios-pizza-legenda-cor" style={{ background: coresPizza[i % coresPizza.length] }} />
                    <span className="relatorios-pizza-legenda-text" title={g.descricao}>
                      {g.descricao.length > 22 ? g.descricao.slice(0, 22) + '…' : g.descricao}
                    </span>
                    <span className="relatorios-pizza-legenda-valor">{formatarMoeda(g.valor)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Relatorios
