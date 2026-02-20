import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { listarReceitas, criarReceita, atualizarReceita, excluirReceita } from '../api/receitas'
import { useToast } from '../context/ToastContext'
import { formatarMoeda, formatarData } from '../utils/format'
import ConfirmModal from '../components/ConfirmModal'
import EmptyState from '../components/EmptyState'
import './Receitas.css'

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const formInicial = { descricao: '', valor: '', data: new Date().toISOString().slice(0, 10), observacao: '' }

function Receitas() {
  const [receitas, setReceitas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [form, setForm] = useState(formInicial)
  const [enviando, setEnviando] = useState(false)
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false)
  const [receitaEmEdicaoId, setReceitaEmEdicaoId] = useState(null)
  const [formEdicao, setFormEdicao] = useState(formInicial)
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false)
  const [idParaExcluir, setIdParaExcluir] = useState(null)
  const [busca, setBusca] = useState('')
  const [filtroMes, setFiltroMes] = useState('')
  const [filtroAno, setFiltroAno] = useState('')
  const { toast } = useToast()
  const location = useLocation()

  useEffect(() => {
    const state = location.state
    if (state?.mes != null && state?.ano != null) {
      setFiltroMes(String(state.mes))
      setFiltroAno(String(state.ano))
    }
  }, [location.state])

  function carregar() {
    setCarregando(true)
    setErro(null)
    listarReceitas()
      .then(setReceitas)
      .catch((e) => setErro(e.message || 'Erro ao carregar.'))
      .finally(() => setCarregando(false))
  }

  useEffect(() => { carregar() }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function limpar() {
    setForm(formInicial)
  }

  function abrirModalEdicao(r) {
    setFormEdicao({ descricao: r.descricao, valor: String(r.valor), data: r.data, observacao: r.observacao || '' })
    setReceitaEmEdicaoId(r.id)
    setModalEdicaoAberto(true)
  }

  function fecharModalEdicao() {
    setModalEdicaoAberto(false)
    setReceitaEmEdicaoId(null)
  }

  function handleChangeEdicao(e) {
    const { name, value } = e.target
    setFormEdicao((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmitEdicao(e) {
    e.preventDefault()
    const payload = { descricao: formEdicao.descricao.trim(), valor: Number(formEdicao.valor), data: formEdicao.data, observacao: formEdicao.observacao.trim() || null }
    if (!payload.descricao || payload.valor < 0) return
    setEnviando(true)
    atualizarReceita(receitaEmEdicaoId, payload)
      .then(() => {
        fecharModalEdicao()
        carregar()
        toast('Receita atualizada.', 'success')
      })
      .catch((e) => {
        setErro(e.detail?.detail ?? e.message)
        toast(e.detail?.detail ?? e.message ?? 'Erro ao salvar.', 'error')
      })
      .finally(() => setEnviando(false))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = { descricao: form.descricao.trim(), valor: Number(form.valor), data: form.data, observacao: form.observacao.trim() || null }
    if (!payload.descricao || payload.valor < 0) return
    setEnviando(true)
    criarReceita(payload)
      .then(() => {
        limpar()
        carregar()
        toast('Receita adicionada.', 'success')
      })
      .catch((e) => {
        setErro(e.detail?.detail ?? e.message)
        toast(e.detail?.detail ?? e.message ?? 'Erro ao salvar.', 'error')
      })
      .finally(() => setEnviando(false))
  }

  useEffect(() => {
    function onEscape(e) {
      if (e.key === 'Escape') fecharModalEdicao()
    }
    if (modalEdicaoAberto) {
      document.addEventListener('keydown', onEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onEscape)
      document.body.style.overflow = ''
    }
  }, [modalEdicaoAberto])

  function abrirModalExcluir(id) {
    setIdParaExcluir(id)
    setModalExcluirAberto(true)
  }

  function fecharModalExcluir() {
    if (!enviando) {
      setModalExcluirAberto(false)
      setIdParaExcluir(null)
    }
  }

  function confirmarExcluir() {
    if (idParaExcluir == null) return
    setEnviando(true)
    excluirReceita(idParaExcluir)
      .then(() => {
        fecharModalExcluir()
        carregar()
        toast('Receita excluída.', 'success')
      })
      .catch((e) => {
        setErro(e.detail?.detail ?? e.message)
        toast(e.detail?.detail ?? e.message ?? 'Erro ao excluir.', 'error')
      })
      .finally(() => setEnviando(false))
  }

  if (carregando) {
    return (
      <div className="receitas">
        <header className="page-header"><h1>Receitas</h1><p>Suas entradas de dinheiro</p></header>
        <p className="card-text">Carregando...</p>
      </div>
    )
  }

  const receitasFiltradas = receitas.filter((r) => {
    const d = new Date(r.data + 'T12:00:00')
    if (filtroMes !== '' && d.getMonth() !== Number(filtroMes)) return false
    if (filtroAno !== '' && d.getFullYear() !== Number(filtroAno)) return false
    if (busca.trim() && !r.descricao?.toLowerCase().includes(busca.trim().toLowerCase())) return false
    return true
  })
  const totalFiltrado = receitasFiltradas.reduce((s, r) => s + Number(r.valor), 0)
  const anos = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2]

  return (
    <div className="receitas">
      <header className="page-header">
        <h1>Receitas</h1>
        <p>Suas entradas de dinheiro</p>
      </header>
      {erro && <div className="card card-erro"><p className="card-text">{erro}</p></div>}
      <div className="card receitas-form-card">
        <div className="card-title">Nova receita</div>
        <form className="receitas-form" onSubmit={handleSubmit}>
          <div className="receitas-form-grid">
            <div className="receitas-field">
              <label className="receitas-label" htmlFor="rec-descricao">Descrição</label>
              <input id="rec-descricao" name="descricao" type="text" value={form.descricao} onChange={handleChange} required placeholder="Ex: Salário" className="receitas-input" />
            </div>
            <div className="receitas-field">
              <label className="receitas-label" htmlFor="rec-valor">Valor (R$)</label>
              <input id="rec-valor" name="valor" type="number" step="0.01" min="0" value={form.valor} onChange={handleChange} required className="receitas-input" />
            </div>
            <div className="receitas-field">
              <label className="receitas-label" htmlFor="rec-data">Data</label>
              <input id="rec-data" name="data" type="date" value={form.data} onChange={handleChange} required className="receitas-input" />
            </div>
          </div>
          <div className="receitas-field">
            <label className="receitas-label" htmlFor="rec-obs">Observação</label>
            <input id="rec-obs" name="observacao" type="text" value={form.observacao} onChange={handleChange} placeholder="Opcional" className="receitas-input" />
          </div>
          <div className="receitas-form-actions">
            <button type="submit" className="receitas-btn receitas-btn-primary" disabled={enviando}>{enviando ? 'Adicionando...' : 'Adicionar'}</button>
          </div>
        </form>
      </div>
      <div className="card">
        <div className="card-title">Lista de receitas</div>
        {receitas.length > 0 && (
          <div className="receitas-filtros">
            <input
              type="search"
              placeholder="Buscar por descrição..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="receitas-input receitas-busca"
              aria-label="Buscar"
            />
            <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} className="receitas-input receitas-select" aria-label="Mês">
              <option value="">Todos os meses</option>
              {MESES.map((nome, i) => (
                <option key={i} value={i}>{nome}</option>
              ))}
            </select>
            <select value={filtroAno} onChange={(e) => setFiltroAno(e.target.value)} className="receitas-input receitas-select" aria-label="Ano">
              <option value="">Todos os anos</option>
              {anos.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            {(filtroMes !== '' || filtroAno !== '') && (
              <span className="receitas-total-filtro">Total: {formatarMoeda(totalFiltrado)}</span>
            )}
          </div>
        )}
        {receitas.length === 0 ? (
          <EmptyState
            icon="trending"
            title="Nenhuma receita cadastrada"
            description="Registre suas fontes de renda como salário, freelance, investimentos e outras entradas. Use o formulário acima para começar."
          />
        ) : (
          <div className="receitas-tabela-wrap">
            <table className="receitas-tabela">
              <thead>
                <tr><th>Data</th><th>Descrição</th><th className="receitas-valor-col">Valor</th><th></th></tr>
              </thead>
              <tbody>
                {receitasFiltradas.map((r) => (
                  <tr key={r.id}>
                    <td>{formatarData(r.data)}</td>
                    <td>{r.descricao}</td>
                    <td className="receitas-valor-col receitas-valor-verde">{formatarMoeda(r.valor)}</td>
                    <td className="receitas-acoes">
                      <button type="button" className="receitas-acao receitas-acao-editar" onClick={() => abrirModalEdicao(r)} aria-label="Editar receita">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        <span>Editar</span>
                      </button>
                      <button type="button" className="receitas-acao receitas-acao-excluir" onClick={() => abrirModalExcluir(r.id)} aria-label="Excluir receita">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                        <span>Excluir</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalEdicaoAberto && (
        <div className="receitas-modal-overlay" onClick={fecharModalEdicao} role="dialog" aria-modal="true" aria-labelledby="receitas-modal-title">
          <div className="receitas-modal" onClick={(e) => e.stopPropagation()}>
            <div className="receitas-modal-header">
              <h2 id="receitas-modal-title" className="receitas-modal-title">Editar receita</h2>
              <button type="button" className="receitas-modal-fechar" onClick={fecharModalEdicao} aria-label="Fechar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <form className="receitas-form receitas-modal-form" onSubmit={handleSubmitEdicao}>
              <div className="receitas-form-grid receitas-modal-grid">
                <div className="receitas-field">
                  <label className="receitas-label" htmlFor="edit-rec-descricao">Descrição</label>
                  <input id="edit-rec-descricao" name="descricao" type="text" value={formEdicao.descricao} onChange={handleChangeEdicao} required placeholder="Ex: Salário" className="receitas-input" />
                </div>
                <div className="receitas-field">
                  <label className="receitas-label" htmlFor="edit-rec-valor">Valor (R$)</label>
                  <input id="edit-rec-valor" name="valor" type="number" step="0.01" min="0" value={formEdicao.valor} onChange={handleChangeEdicao} required className="receitas-input" />
                </div>
                <div className="receitas-field">
                  <label className="receitas-label" htmlFor="edit-rec-data">Data</label>
                  <input id="edit-rec-data" name="data" type="date" value={formEdicao.data} onChange={handleChangeEdicao} required className="receitas-input" />
                </div>
              </div>
              <div className="receitas-field">
                <label className="receitas-label" htmlFor="edit-rec-obs">Observação</label>
                <input id="edit-rec-obs" name="observacao" type="text" value={formEdicao.observacao} onChange={handleChangeEdicao} placeholder="Opcional" className="receitas-input" />
              </div>
              <div className="receitas-form-actions receitas-modal-actions">
                <button type="button" className="receitas-btn receitas-btn-secondary" onClick={fecharModalEdicao} disabled={enviando}>Cancelar</button>
                <button type="submit" className="receitas-btn receitas-btn-primary" disabled={enviando}>{enviando ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={modalExcluirAberto}
        title="Excluir receita"
        message="Tem certeza que deseja excluir esta receita? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        loading={enviando}
        onConfirm={confirmarExcluir}
        onCancel={fecharModalExcluir}
      />
    </div>
  )
}

export default Receitas
