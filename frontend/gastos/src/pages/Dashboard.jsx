import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getResumoMes } from '../api/resumo'
import { formatarMoeda, formatarData } from '../utils/format'
import EmptyState from '../components/EmptyState'
import './Dashboard.css'

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const IconGasto = () => (
  <svg className="dashboard-card-icon dashboard-card-icon-gasto" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)
const IconReceita = () => (
  <svg className="dashboard-card-icon dashboard-card-icon-receita" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M12 5v14M5 12h14" />
    <circle cx="12" cy="12" r="10" />
  </svg>
)
const IconSaldo = () => (
  <svg className="dashboard-card-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M12 8v8M8 12h8" />
  </svg>
)

function Dashboard() {
  const agora = new Date()
  const [resumo, setResumo] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [mesSelecionado, setMesSelecionado] = useState(agora.getMonth())
  const [anoSelecionado, setAnoSelecionado] = useState(agora.getFullYear())

  useEffect(() => {
    let cancel = false
    async function carregar() {
      setCarregando(true)
      setErro(null)
      try {
        const data = await getResumoMes(mesSelecionado, anoSelecionado)
        if (!cancel) setResumo(data)
      } catch (e) {
        if (!cancel) setErro(e.message || 'Erro ao carregar dados.')
      } finally {
        if (!cancel) setCarregando(false)
      }
    }
    carregar()
    return () => { cancel = true }
  }, [mesSelecionado, anoSelecionado])

  const totalGastosMes = resumo ? Number(resumo.total_gastos) : 0
  const totalReceitasMes = resumo ? Number(resumo.total_receitas) : 0
  const saldoMes = resumo ? Number(resumo.saldo) : 0
  const meta = resumo?.meta_gastos_mes != null ? Number(resumo.meta_gastos_mes) : null
  const ultimosGastos = resumo?.ultimos_gastos ?? []
  const gastosMesCount = resumo?.gastos_mes_count ?? 0
  const receitasMesCount = resumo?.receitas_mes_count ?? 0
  const totalGastosCount = resumo?.total_gastos_count ?? 0
  const totalReceitasCount = resumo?.total_receitas_count ?? 0

  const anos = [agora.getFullYear(), agora.getFullYear() - 1, agora.getFullYear() - 2]

  if (carregando) {
    return (
      <div className="dashboard">
        <header className="page-header">
          <h1>Dashboard</h1>
          <p>Visão geral das suas finanças</p>
        </header>
        <div className="dashboard-loading">
          <span className="app-spinner" />
          <span>Carregando...</span>
        </div>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="dashboard">
        <header className="page-header">
          <h1>Dashboard</h1>
          <p>Visão geral das suas finanças</p>
        </header>
        <div className="card card-erro">
          <p className="card-text">{erro}</p>
          <p className="card-text card-erro-dica">Verifique se a API está rodando em http://localhost:8000</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header className="page-header dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Visão geral das suas finanças</p>
        </div>
        <div className="dashboard-filtro">
          <select
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(Number(e.target.value))}
            className="dashboard-select"
            aria-label="Mês"
          >
            {MESES.map((nome, i) => (
              <option key={i} value={i}>{nome}</option>
            ))}
          </select>
          <select
            value={anoSelecionado}
            onChange={(e) => setAnoSelecionado(Number(e.target.value))}
            className="dashboard-select"
            aria-label="Ano"
          >
            {anos.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="dashboard-cards">
        <Link
          to="/app/gastos"
          state={{ mes: mesSelecionado, ano: anoSelecionado }}
          className="card dashboard-card dashboard-card-link"
          aria-label="Ver gastos do mês em Gastos"
        >
          <div className="dashboard-card-top">
            <span className="card-title">Gastos do mês</span>
            <IconGasto />
          </div>
          <div className="card-value card-value-gasto">{formatarMoeda(totalGastosMes)}</div>
          <span className="dashboard-card-hint">Ver detalhes →</span>
        </Link>
        <Link
          to="/app/receitas"
          state={{ mes: mesSelecionado, ano: anoSelecionado }}
          className="card dashboard-card dashboard-card-link"
          aria-label="Ver receitas do mês em Receitas"
        >
          <div className="dashboard-card-top">
            <span className="card-title">Receitas do mês</span>
            <IconReceita />
          </div>
          <div className="card-value card-value-receita">{formatarMoeda(totalReceitasMes)}</div>
          <span className="dashboard-card-hint">Ver detalhes →</span>
        </Link>
        <Link
          to="/app/relatorios"
          className="card dashboard-card dashboard-card-link"
          aria-label="Ver análise em Relatórios"
        >
          <div className="dashboard-card-top">
            <span className="card-title">Saldo do mês</span>
            <IconSaldo />
          </div>
          <div className={`card-value ${saldoMes >= 0 ? 'card-value-saldo-pos' : 'card-value-saldo-neg'}`}>
            {formatarMoeda(saldoMes)}
          </div>
          <span className="dashboard-card-hint">Ver relatórios →</span>
        </Link>
      </div>

      {meta != null && meta > 0 && (
        <Link
          to="/app/usuario"
          state={{ scrollToMeta: true }}
          className="card card-meta dashboard-card-link"
          aria-label="Editar meta de gastos em Usuário"
        >
          <div className="card-title">Meta de gastos — {MESES[mesSelecionado]} {anoSelecionado}</div>
          <div className="dashboard-meta-valores">
            <span>{formatarMoeda(totalGastosMes)}</span>
            <span className="dashboard-meta-de"> de </span>
            <span>{formatarMoeda(meta)}</span>
          </div>
          <div className="dashboard-meta-bar">
            <div
              className="dashboard-meta-bar-fill"
              style={{ width: `${Math.min(100, (totalGastosMes / meta) * 100)}%` }}
            />
          </div>
          {totalGastosMes > meta && (
            <p className="dashboard-meta-alerta">Você ultrapassou a meta deste mês.</p>
          )}
          <span className="dashboard-card-hint">Editar meta →</span>
        </Link>
      )}

      <div className="dashboard-grid">
        <Link
          to="/app/gastos"
          state={{ mes: mesSelecionado, ano: anoSelecionado }}
          className="card dashboard-card-link"
          aria-label="Ver todos os gastos do mês em Gastos"
        >
          <div className="card-title">Últimos gastos — {MESES[mesSelecionado]}</div>
          {ultimosGastos.length === 0 ? (
            <EmptyState
              icon="wallet"
              title="Nenhum gasto este mês"
              description="Clique aqui para adicionar seu primeiro gasto do mês."
            />
          ) : (
            <ul className="dashboard-lista">
              {ultimosGastos.map((g) => (
                <li key={g.id} className="dashboard-lista-item">
                  <span className="dashboard-lista-desc">{g.descricao}</span>
                  <span className="dashboard-lista-valor">{formatarMoeda(g.valor)}</span>
                  <span className="dashboard-lista-data">{formatarData(g.data)}</span>
                </li>
              ))}
            </ul>
          )}
          <span className="dashboard-link">Ver todos os gastos →</span>
        </Link>

        <Link
          to="/app/relatorios"
          className="card dashboard-card-link"
          aria-label="Ver resumo e relatórios"
        >
          <div className="card-title">Resumo do período</div>
          <p className="card-text">
            {totalGastosCount === 0 && totalReceitasCount === 0
              ? 'Nenhum lançamento ainda. Adicione gastos e receitas para acompanhar.'
              : `Em ${MESES[mesSelecionado]}/${anoSelecionado}: ${gastosMesCount} gasto(s) e ${receitasMesCount} receita(s). Total geral: ${totalGastosCount} gastos e ${totalReceitasCount} receitas.`}
          </p>
          <span className="dashboard-card-hint">Ver relatórios →</span>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard
