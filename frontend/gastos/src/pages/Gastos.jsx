import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { listarGastos, criarGasto, atualizarGasto, excluirGasto } from '../api/gastos'
import { listarCategorias } from '../api/categorias'
import { useToast } from '../context/ToastContext'
import { formatarMoeda, formatarData } from '../utils/format'
import ConfirmModal from '../components/ConfirmModal'
import EmptyState from '../components/EmptyState'
import './Gastos.css'

const formInicial = {
  descricao: '',
  valor: '',
  data: new Date().toISOString().slice(0, 10),
  categoria_id: null,
  observacao: '',
}

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

function Gastos() {
  const [gastos, setGastos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [form, setForm] = useState(formInicial)
  const [enviando, setEnviando] = useState(false)
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false)
  const [gastoEmEdicaoId, setGastoEmEdicaoId] = useState(null)
  const [formEdicao, setFormEdicao] = useState(formInicial)
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false)
  const [idParaExcluir, setIdParaExcluir] = useState(null)
  const [filtroMes, setFiltroMes] = useState('')
  const [filtroAno, setFiltroAno] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [busca, setBusca] = useState('')
  const { toast } = useToast()
  const location = useLocation()

  useEffect(() => {
    const state = location.state
    if (state?.mes != null && state?.ano != null) {
      setFiltroMes(String(state.mes))
      setFiltroAno(String(state.ano))
    }
  }, [location.state])

  function carregarDados() {
    setCarregando(true)
    setErro(null)
    Promise.all([listarGastos(), listarCategorias()])
      .then(([g, c]) => {
        setGastos(g)
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

  function abrirModalEdicao(g) {
    setFormEdicao({
      descricao: g.descricao,
      valor: String(g.valor),
      data: g.data,
      categoria_id: g.categoria_id,
      observacao: g.observacao || '',
    })
    setGastoEmEdicaoId(g.id)
    setModalEdicaoAberto(true)
  }

  function fecharModalEdicao() {
    setModalEdicaoAberto(false)
    setGastoEmEdicaoId(null)
  }

  function handleChangeEdicao(e) {
    const { name, value } = e.target
    setFormEdicao((prev) => ({
      ...prev,
      [name]: name === 'categoria_id' ? (value ? Number(value) : null) : value,
    }))
  }

  function handleSubmitEdicao(e) {
    e.preventDefault()
    const payload = {
      descricao: formEdicao.descricao.trim(),
      valor: Number(formEdicao.valor),
      data: formEdicao.data,
      categoria_id: formEdicao.categoria_id || null,
      observacao: formEdicao.observacao.trim() || null,
    }
    if (!payload.descricao || payload.valor < 0) return
    setEnviando(true)
    atualizarGasto(gastoEmEdicaoId, payload)
      .then(() => {
        fecharModalEdicao()
        carregarDados()
        toast('Gasto atualizado.', 'success')
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
      data: form.data,
      categoria_id: form.categoria_id || null,
      observacao: form.observacao.trim() || null,
    }
    if (!payload.descricao || payload.valor < 0) return
    setEnviando(true)
    criarGasto(payload)
      .then(() => {
        limparForm()
        carregarDados()
        toast('Gasto adicionado.', 'success')
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

  const gastosFiltrados = gastos.filter((g) => {
    const d = new Date(g.data + 'T12:00:00')
    if (filtroMes !== '' && d.getMonth() !== Number(filtroMes)) return false
    if (filtroAno !== '' && d.getFullYear() !== Number(filtroAno)) return false
    if (filtroCategoria !== '' && g.categoria_id !== Number(filtroCategoria)) return false
    if (busca.trim()) {
      const q = busca.trim().toLowerCase()
      if (!g.descricao?.toLowerCase().includes(q) && !g.categoria_nome?.toLowerCase().includes(q)) return false
    }
    return true
  })
  const totalFiltrado = gastosFiltrados.reduce((s, g) => s + Number(g.valor), 0)
  const anos = (() => {
    const a = new Date().getFullYear()
    return [a, a - 1, a - 2, a - 3]
  })()

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
    excluirGasto(idParaExcluir)
      .then(() => {
        fecharModalExcluir()
        carregarDados()
        toast('Gasto excluído.', 'success')
      })
      .catch((e) => {
        setErro(e.detail?.detail || e.message)
        toast(e.detail?.detail || e.message || 'Erro ao excluir.', 'error')
      })
      .finally(() => setEnviando(false))
  }

  if (carregando) {
    return (
      <div className="gastos">
        <header className="page-header">
          <h1>Gastos</h1>
          <p>Gerencie seus lançamentos</p>
        </header>
        <p className="card-text">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="gastos">
      <header className="page-header">
        <h1>Gastos</h1>
        <p>Gerencie seus lançamentos</p>
      </header>

      {erro && (
        <div className="card card-erro">
          <p className="card-text">{erro}</p>
        </div>
      )}

      <div className="card gastos-form-card">
        <div className="card-title">Novo gasto</div>
        <form className="gastos-form" onSubmit={handleSubmit}>
          <div className="gastos-form-grid">
            <div className="gastos-field">
              <label className="gastos-label" htmlFor="descricao">Descrição</label>
              <input
                id="descricao"
                name="descricao"
                type="text"
                value={form.descricao}
                onChange={handleChange}
                required
                placeholder="Ex: Supermercado"
                className="gastos-input"
              />
            </div>
            <div className="gastos-field">
              <label className="gastos-label" htmlFor="valor">Valor (R$)</label>
              <input
                id="valor"
                name="valor"
                type="number"
                step="0.01"
                min="0"
                value={form.valor}
                onChange={handleChange}
                required
                placeholder="0,00"
                className="gastos-input"
              />
            </div>
            <div className="gastos-field">
              <label className="gastos-label" htmlFor="data">Data</label>
              <input
                id="data"
                name="data"
                type="date"
                value={form.data}
                onChange={handleChange}
                required
                className="gastos-input"
              />
            </div>
            <div className="gastos-field">
              <label className="gastos-label" htmlFor="categoria_id">Categoria</label>
              <select
                id="categoria_id"
                name="categoria_id"
                value={form.categoria_id ?? ''}
                onChange={handleChange}
                className="gastos-select"
              >
                <option value="">— Nenhuma —</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.icone ? `${c.icone} ` : ''}{c.nome}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="gastos-field">
            <label className="gastos-label" htmlFor="observacao">Observação</label>
            <input
              id="observacao"
              name="observacao"
              type="text"
              value={form.observacao}
              onChange={handleChange}
              placeholder="Opcional"
              className="gastos-input"
            />
          </div>
          <div className="gastos-form-actions">
            <button type="submit" className="gastos-btn gastos-btn-primary" disabled={enviando}>
              {enviando ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-title">Lista de gastos</div>
        {gastos.length > 0 && (
          <div className="gastos-filtros">
            <input
              type="search"
              placeholder="Buscar por descrição ou categoria..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="gastos-input gastos-busca"
              aria-label="Buscar"
            />
            <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} className="gastos-select gastos-filtro">
              <option value="">Todos os meses</option>
              {MESES.map((nome, i) => (
                <option key={i} value={i}>{nome}</option>
              ))}
            </select>
            <select value={filtroAno} onChange={(e) => setFiltroAno(e.target.value)} className="gastos-select gastos-filtro">
              <option value="">Todos os anos</option>
              {anos.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="gastos-select gastos-filtro">
              <option value="">Todas as categorias</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.icone ? `${c.icone} ` : ''}{c.nome}</option>
              ))}
            </select>
            {(filtroMes !== '' || filtroAno !== '' || filtroCategoria !== '') && (
              <span className="gastos-total-filtro">Total: {formatarMoeda(totalFiltrado)}</span>
            )}
          </div>
        )}
        {gastos.length === 0 ? (
          <EmptyState
            icon="money"
            title="Nenhum gasto cadastrado"
            description="Comece a registrar seus gastos para ter controle total das suas finanças. Use o formulário acima para adicionar seu primeiro gasto."
          />
        ) : (
          <div className="gastos-tabela-wrap">
            <table className="gastos-tabela">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th className="gastos-valor-col">Valor</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {gastosFiltrados.map((g) => (
                  <tr key={g.id}>
                    <td>{formatarData(g.data)}</td>
                    <td>{g.descricao}</td>
                    <td>
                      {g.categoria_nome ? (
                        <span className="gastos-categoria-badge" style={{ color: g.categoria_cor || 'inherit' }}>
                          {g.categoria_icone && <span className="gastos-categoria-icone">{g.categoria_icone}</span>}
                          {g.categoria_nome}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="gastos-valor-col">{formatarMoeda(g.valor)}</td>
                    <td className="gastos-acoes">
                      <button type="button" className="gastos-acao gastos-acao-editar" onClick={() => abrirModalEdicao(g)} aria-label="Editar gasto">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        <span>Editar</span>
                      </button>
                      <button type="button" className="gastos-acao gastos-acao-excluir" onClick={() => abrirModalExcluir(g.id)} aria-label="Excluir gasto">
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
        <div className="gastos-modal-overlay" onClick={fecharModalEdicao} role="dialog" aria-modal="true" aria-labelledby="gastos-modal-title">
          <div className="gastos-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gastos-modal-header">
              <h2 id="gastos-modal-title" className="gastos-modal-title">Editar gasto</h2>
              <button type="button" className="gastos-modal-fechar" onClick={fecharModalEdicao} aria-label="Fechar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <form className="gastos-form gastos-modal-form" onSubmit={handleSubmitEdicao}>
              <div className="gastos-form-grid">
                <div className="gastos-field">
                  <label className="gastos-label" htmlFor="edit-descricao">Descrição</label>
                  <input id="edit-descricao" name="descricao" type="text" value={formEdicao.descricao} onChange={handleChangeEdicao} required placeholder="Ex: Supermercado" className="gastos-input" />
                </div>
                <div className="gastos-field">
                  <label className="gastos-label" htmlFor="edit-valor">Valor (R$)</label>
                  <input id="edit-valor" name="valor" type="number" step="0.01" min="0" value={formEdicao.valor} onChange={handleChangeEdicao} required placeholder="0,00" className="gastos-input" />
                </div>
                <div className="gastos-field">
                  <label className="gastos-label" htmlFor="edit-data">Data</label>
                  <input id="edit-data" name="data" type="date" value={formEdicao.data} onChange={handleChangeEdicao} required className="gastos-input" />
                </div>
                <div className="gastos-field">
                  <label className="gastos-label" htmlFor="edit-categoria_id">Categoria</label>
                  <select id="edit-categoria_id" name="categoria_id" value={formEdicao.categoria_id ?? ''} onChange={handleChangeEdicao} className="gastos-select">
                    <option value="">— Nenhuma —</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.icone ? `${c.icone} ` : ''}{c.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="gastos-field">
                <label className="gastos-label" htmlFor="edit-observacao">Observação</label>
                <input id="edit-observacao" name="observacao" type="text" value={formEdicao.observacao} onChange={handleChangeEdicao} placeholder="Opcional" className="gastos-input" />
              </div>
              <div className="gastos-form-actions gastos-modal-actions">
                <button type="button" className="gastos-btn gastos-btn-secondary" onClick={fecharModalEdicao} disabled={enviando}>Cancelar</button>
                <button type="submit" className="gastos-btn gastos-btn-primary" disabled={enviando}>{enviando ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={modalExcluirAberto}
        title="Excluir gasto"
        message="Tem certeza que deseja excluir este gasto? Esta ação não pode ser desfeita."
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

export default Gastos
