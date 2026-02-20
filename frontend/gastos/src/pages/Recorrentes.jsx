import { useEffect, useState } from 'react'
import {
  listarRecorrentes,
  criarRecorrente,
  atualizarRecorrente,
  excluirRecorrente,
  processarPendentes,
} from '../api/gastosRecorrentes'
import { listarCategorias } from '../api/categorias'
import { useToast } from '../context/ToastContext'
import { formatarMoeda } from '../utils/format'
import ConfirmModal from '../components/ConfirmModal'
import EmptyState from '../components/EmptyState'
import './Recorrentes.css'

const FREQUENCIAS = [
  { value: 'mensal', label: 'Mensal' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'anual', label: 'Anual' },
]

const formInicial = {
  descricao: '',
  valor: '',
  dia_vencimento: '1',
  frequencia: 'mensal',
  categoria_id: null,
  observacao: '',
}

function Recorrentes() {
  const [recorrentes, setRecorrentes] = useState([])
  const [categorias, setCategorias] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [form, setForm] = useState(formInicial)
  const [enviando, setEnviando] = useState(false)
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false)
  const [recorrenteEmEdicaoId, setRecorrenteEmEdicaoId] = useState(null)
  const [formEdicao, setFormEdicao] = useState(formInicial)
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false)
  const [idParaExcluir, setIdParaExcluir] = useState(null)
  const [processando, setProcessando] = useState(false)
  const { toast } = useToast()

  function carregarDados() {
    setCarregando(true)
    setErro(null)
    Promise.all([listarRecorrentes(), listarCategorias()])
      .then(([r, c]) => {
        setRecorrentes(r)
        setCategorias(c)
      })
      .catch((e) => setErro(e.message || 'Erro ao carregar.'))
      .finally(() => setCarregando(false))
  }

  useEffect(() => {
    carregarDados()
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'categoria_id' ? (value ? Number(value) : null) : value,
    }))
  }

  function limparForm() {
    setForm(formInicial)
  }

  function abrirModalEdicao(r) {
    setFormEdicao({
      descricao: r.descricao,
      valor: String(r.valor),
      dia_vencimento: String(r.dia_vencimento),
      frequencia: r.frequencia,
      categoria_id: r.categoria_id,
      observacao: r.observacao || '',
      ativo: r.ativo,
    })
    setRecorrenteEmEdicaoId(r.id)
    setModalEdicaoAberto(true)
  }

  function fecharModalEdicao() {
    setModalEdicaoAberto(false)
    setRecorrenteEmEdicaoId(null)
  }

  function handleChangeEdicao(e) {
    const { name, value, type, checked } = e.target
    setFormEdicao((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'categoria_id' ? (value ? Number(value) : null) : value,
    }))
  }

  function handleSubmitEdicao(e) {
    e.preventDefault()
    const payload = {
      descricao: formEdicao.descricao.trim(),
      valor: Number(formEdicao.valor),
      dia_vencimento: Number(formEdicao.dia_vencimento),
      frequencia: formEdicao.frequencia,
      categoria_id: formEdicao.categoria_id || null,
      observacao: formEdicao.observacao.trim() || null,
      ativo: formEdicao.ativo,
    }
    if (!payload.descricao || payload.valor <= 0) return
    setEnviando(true)
    atualizarRecorrente(recorrenteEmEdicaoId, payload)
      .then(() => {
        fecharModalEdicao()
        carregarDados()
        toast('Gasto recorrente atualizado.', 'success')
      })
      .catch((e) => {
        setErro(e.detail?.detail || e.message)
        toast(e.detail?.detail || e.message || 'Erro ao salvar.', 'error')
      })
      .finally(() => setEnviando(false))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      descricao: form.descricao.trim(),
      valor: Number(form.valor),
      dia_vencimento: Number(form.dia_vencimento),
      frequencia: form.frequencia,
      categoria_id: form.categoria_id || null,
      observacao: form.observacao.trim() || null,
    }
    if (!payload.descricao || payload.valor <= 0) return
    setEnviando(true)
    criarRecorrente(payload)
      .then(() => {
        limparForm()
        carregarDados()
        toast('Gasto recorrente criado.', 'success')
      })
      .catch((e) => {
        setErro(e.detail?.detail || e.message)
        toast(e.detail?.detail || e.message || 'Erro ao salvar.', 'error')
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
    excluirRecorrente(idParaExcluir)
      .then(() => {
        fecharModalExcluir()
        carregarDados()
        toast('Gasto recorrente excluído.', 'success')
      })
      .catch((e) => {
        setErro(e.detail?.detail || e.message)
        toast(e.detail?.detail || e.message || 'Erro ao excluir.', 'error')
      })
      .finally(() => setEnviando(false))
  }

  async function handleProcessarPendentes() {
    setProcessando(true)
    try {
      const result = await processarPendentes()
      if (result.gastos_gerados > 0) {
        toast(`${result.gastos_gerados} gasto(s) gerado(s) automaticamente.`, 'success')
        carregarDados()
      } else {
        toast('Nenhum gasto pendente para processar.', 'info')
      }
    } catch (e) {
      toast(e.detail?.detail || e.message || 'Erro ao processar.', 'error')
    } finally {
      setProcessando(false)
    }
  }

  function formatarProximoLancamento(dataStr) {
    const d = new Date(dataStr + 'T12:00:00')
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const diff = Math.ceil((d - hoje) / (1000 * 60 * 60 * 24))
    const dataFormatada = d.toLocaleDateString('pt-BR')
    if (diff < 0) return <span className="recorrentes-vencido">Vencido ({dataFormatada})</span>
    if (diff === 0) return <span className="recorrentes-hoje">Hoje</span>
    if (diff === 1) return <span className="recorrentes-proximo">Amanhã</span>
    if (diff <= 7) return <span className="recorrentes-proximo">Em {diff} dias</span>
    return dataFormatada
  }

  function getCategoriaDisplay(r) {
    if (!r.categoria_nome) return '—'
    return (
      <span className="recorrentes-categoria">
        {r.categoria_icone && <span className="recorrentes-categoria-icone">{r.categoria_icone}</span>}
        <span style={{ color: r.categoria_cor || 'inherit' }}>{r.categoria_nome}</span>
      </span>
    )
  }

  const totalMensal = recorrentes
    .filter((r) => r.ativo && r.frequencia === 'mensal')
    .reduce((s, r) => s + Number(r.valor), 0)

  if (carregando) {
    return (
      <div className="recorrentes">
        <header className="page-header">
          <h1>Gastos Recorrentes</h1>
          <p>Configure despesas que se repetem</p>
        </header>
        <p className="card-text">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="recorrentes">
      <header className="page-header">
        <div className="page-header-content">
          <div>
            <h1>Gastos Recorrentes</h1>
            <p>Configure despesas que se repetem</p>
          </div>
          <button
            type="button"
            className="recorrentes-btn-processar"
            onClick={handleProcessarPendentes}
            disabled={processando}
          >
            {processando ? 'Processando...' : 'Processar Pendentes'}
          </button>
        </div>
      </header>

      {erro && (
        <div className="card card-erro">
          <p className="card-text">{erro}</p>
        </div>
      )}

      <div className="card recorrentes-form-card">
        <div className="card-title">Novo gasto recorrente</div>
        <form className="recorrentes-form" onSubmit={handleSubmit}>
          <div className="recorrentes-form-grid">
            <div className="recorrentes-field">
              <label className="recorrentes-label" htmlFor="descricao">Descrição</label>
              <input
                id="descricao"
                name="descricao"
                type="text"
                value={form.descricao}
                onChange={handleChange}
                required
                placeholder="Ex: Netflix"
                className="recorrentes-input"
              />
            </div>
            <div className="recorrentes-field">
              <label className="recorrentes-label" htmlFor="valor">Valor (R$)</label>
              <input
                id="valor"
                name="valor"
                type="number"
                step="0.01"
                min="0.01"
                value={form.valor}
                onChange={handleChange}
                required
                placeholder="0,00"
                className="recorrentes-input"
              />
            </div>
            <div className="recorrentes-field">
              <label className="recorrentes-label" htmlFor="dia_vencimento">Dia do mês</label>
              <input
                id="dia_vencimento"
                name="dia_vencimento"
                type="number"
                min="1"
                max="31"
                value={form.dia_vencimento}
                onChange={handleChange}
                required
                className="recorrentes-input"
              />
            </div>
            <div className="recorrentes-field">
              <label className="recorrentes-label" htmlFor="frequencia">Frequência</label>
              <select
                id="frequencia"
                name="frequencia"
                value={form.frequencia}
                onChange={handleChange}
                className="recorrentes-select"
              >
                {FREQUENCIAS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div className="recorrentes-field">
              <label className="recorrentes-label" htmlFor="categoria_id">Categoria</label>
              <select
                id="categoria_id"
                name="categoria_id"
                value={form.categoria_id ?? ''}
                onChange={handleChange}
                className="recorrentes-select"
              >
                <option value="">— Nenhuma —</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.icone ? `${c.icone} ` : ''}{c.nome}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="recorrentes-field">
            <label className="recorrentes-label" htmlFor="observacao">Observação</label>
            <input
              id="observacao"
              name="observacao"
              type="text"
              value={form.observacao}
              onChange={handleChange}
              placeholder="Opcional"
              className="recorrentes-input"
            />
          </div>
          <div className="recorrentes-form-actions">
            <button type="submit" className="recorrentes-btn recorrentes-btn-primary" disabled={enviando}>
              {enviando ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-header-row">
          <div className="card-title">Gastos recorrentes ativos</div>
          {totalMensal > 0 && (
            <div className="recorrentes-total">
              Total mensal: <strong>{formatarMoeda(totalMensal)}</strong>
            </div>
          )}
        </div>
        {recorrentes.length === 0 ? (
          <EmptyState
            icon="repeat"
            title="Nenhum gasto recorrente"
            description="Configure despesas que se repetem automaticamente, como assinaturas, contas fixas e mensalidades."
          />
        ) : (
          <div className="recorrentes-lista">
            {recorrentes.map((r) => (
              <div key={r.id} className={`recorrentes-item ${!r.ativo ? 'recorrentes-item-inativo' : ''}`}>
                <div className="recorrentes-item-main">
                  <div className="recorrentes-item-info">
                    <span className="recorrentes-item-descricao">
                      {r.categoria_icone && <span className="recorrentes-item-icone">{r.categoria_icone}</span>}
                      {r.descricao}
                      {!r.ativo && <span className="recorrentes-badge-inativo">Inativo</span>}
                    </span>
                    <span className="recorrentes-item-meta">
                      {getCategoriaDisplay(r)} • {FREQUENCIAS.find((f) => f.value === r.frequencia)?.label || r.frequencia}
                    </span>
                  </div>
                  <div className="recorrentes-item-valor">{formatarMoeda(r.valor)}</div>
                </div>
                <div className="recorrentes-item-footer">
                  <span className="recorrentes-item-proximo">
                    Próximo: {formatarProximoLancamento(r.proximo_lancamento)}
                  </span>
                  <div className="recorrentes-item-acoes">
                    <button type="button" className="recorrentes-acao" onClick={() => abrirModalEdicao(r)} aria-label="Editar">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                    <button type="button" className="recorrentes-acao recorrentes-acao-excluir" onClick={() => abrirModalExcluir(r.id)} aria-label="Excluir">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalEdicaoAberto && (
        <div className="recorrentes-modal-overlay" onClick={fecharModalEdicao} role="dialog" aria-modal="true">
          <div className="recorrentes-modal" onClick={(e) => e.stopPropagation()}>
            <div className="recorrentes-modal-header">
              <h2 className="recorrentes-modal-title">Editar gasto recorrente</h2>
              <button type="button" className="recorrentes-modal-fechar" onClick={fecharModalEdicao} aria-label="Fechar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <form className="recorrentes-form recorrentes-modal-form" onSubmit={handleSubmitEdicao}>
              <div className="recorrentes-form-grid">
                <div className="recorrentes-field">
                  <label className="recorrentes-label" htmlFor="edit-descricao">Descrição</label>
                  <input id="edit-descricao" name="descricao" type="text" value={formEdicao.descricao} onChange={handleChangeEdicao} required className="recorrentes-input" />
                </div>
                <div className="recorrentes-field">
                  <label className="recorrentes-label" htmlFor="edit-valor">Valor (R$)</label>
                  <input id="edit-valor" name="valor" type="number" step="0.01" min="0.01" value={formEdicao.valor} onChange={handleChangeEdicao} required className="recorrentes-input" />
                </div>
                <div className="recorrentes-field">
                  <label className="recorrentes-label" htmlFor="edit-dia_vencimento">Dia do mês</label>
                  <input id="edit-dia_vencimento" name="dia_vencimento" type="number" min="1" max="31" value={formEdicao.dia_vencimento} onChange={handleChangeEdicao} required className="recorrentes-input" />
                </div>
                <div className="recorrentes-field">
                  <label className="recorrentes-label" htmlFor="edit-frequencia">Frequência</label>
                  <select id="edit-frequencia" name="frequencia" value={formEdicao.frequencia} onChange={handleChangeEdicao} className="recorrentes-select">
                    {FREQUENCIAS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div className="recorrentes-field">
                  <label className="recorrentes-label" htmlFor="edit-categoria_id">Categoria</label>
                  <select id="edit-categoria_id" name="categoria_id" value={formEdicao.categoria_id ?? ''} onChange={handleChangeEdicao} className="recorrentes-select">
                    <option value="">— Nenhuma —</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.icone ? `${c.icone} ` : ''}{c.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="recorrentes-field">
                <label className="recorrentes-label" htmlFor="edit-observacao">Observação</label>
                <input id="edit-observacao" name="observacao" type="text" value={formEdicao.observacao} onChange={handleChangeEdicao} placeholder="Opcional" className="recorrentes-input" />
              </div>
              <div className="recorrentes-field recorrentes-field-checkbox">
                <label className="recorrentes-checkbox-label">
                  <input type="checkbox" name="ativo" checked={formEdicao.ativo} onChange={handleChangeEdicao} />
                  <span>Ativo</span>
                </label>
              </div>
              <div className="recorrentes-form-actions recorrentes-modal-actions">
                <button type="button" className="recorrentes-btn recorrentes-btn-secondary" onClick={fecharModalEdicao} disabled={enviando}>Cancelar</button>
                <button type="submit" className="recorrentes-btn recorrentes-btn-primary" disabled={enviando}>{enviando ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={modalExcluirAberto}
        title="Excluir gasto recorrente"
        message="Tem certeza que deseja excluir este gasto recorrente? Esta ação não pode ser desfeita."
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

export default Recorrentes
