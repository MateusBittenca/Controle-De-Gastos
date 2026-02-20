import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import { listarCategorias, criarCategoria, atualizarCategoria, excluirCategoria } from '../api/categorias'
import { formatarMoeda } from '../utils/format'
import ConfirmModal from '../components/ConfirmModal'
import EmptyState from '../components/EmptyState'
import './Configuracoes.css'

const THEME_KEY = 'gastos_theme'

const ICONES_DISPONIVEIS = [
  '🍔', '🍕', '🛒', '🏠', '🚗', '⛽', '💊', '🎬', '✈️', '👕',
  '💡', '📱', '💳', '🎓', '🏋️', '🐕', '🎁', '💼', '🔧', '📦',
  '🎮', '📚', '☕', '🍺', '🎵', '💇', '🏥', '🚌', '🛍️', '💰'
]

const CORES_DISPONIVEIS = [
  '#e74c3c', '#e91e63', '#9b59b6', '#673ab7', '#3f51b5',
  '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
  '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
  '#ff5722', '#795548', '#607d8b', '#9e9e9e', '#2c3e50'
]

function Configuracoes() {
  const [tema, setTema] = useState(() => localStorage.getItem(THEME_KEY) || 'light')
  const [idioma, setIdioma] = useState('pt-BR')
  const [moeda, setMoeda] = useState('BRL')
  const [categorias, setCategorias] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [formCategoria, setFormCategoria] = useState({ nome: '', cor: '#4361ee', icone: '', orcamento_mensal: '' })
  const [enviando, setEnviando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [formEdicao, setFormEdicao] = useState({ nome: '', cor: '', icone: '', orcamento_mensal: '' })
  const [modalExcluir, setModalExcluir] = useState({ open: false, id: null })
  const { toast } = useToast()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema)
    localStorage.setItem(THEME_KEY, tema)
  }, [tema])

  useEffect(() => {
    carregarCategorias()
  }, [])

  async function carregarCategorias() {
    try {
      const data = await listarCategorias()
      setCategorias(data)
    } catch (e) {
      toast('Erro ao carregar categorias', 'error')
    } finally {
      setCarregando(false)
    }
  }

  function handleTemaChange(e) {
    const v = e.target.value
    setTema(v)
    toast(v === 'dark' ? 'Tema escuro ativado.' : 'Tema claro ativado.', 'success')
  }

  async function handleCriarCategoria(e) {
    e.preventDefault()
    if (!formCategoria.nome.trim()) return
    setEnviando(true)
    try {
      await criarCategoria({
        nome: formCategoria.nome.trim(),
        cor: formCategoria.cor || null,
        icone: formCategoria.icone || null,
        orcamento_mensal: formCategoria.orcamento_mensal ? Number(formCategoria.orcamento_mensal) : null,
      })
      setFormCategoria({ nome: '', cor: '#4361ee', icone: '', orcamento_mensal: '' })
      carregarCategorias()
      toast('Categoria criada.', 'success')
    } catch (e) {
      toast(e.message || 'Erro ao criar categoria', 'error')
    } finally {
      setEnviando(false)
    }
  }

  function iniciarEdicao(cat) {
    setEditandoId(cat.id)
    setFormEdicao({
      nome: cat.nome,
      cor: cat.cor || '#4361ee',
      icone: cat.icone || '',
      orcamento_mensal: cat.orcamento_mensal ? String(cat.orcamento_mensal) : '',
    })
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setFormEdicao({ nome: '', cor: '', icone: '', orcamento_mensal: '' })
  }

  async function salvarEdicao() {
    if (!formEdicao.nome.trim()) return
    setEnviando(true)
    try {
      await atualizarCategoria(editandoId, {
        nome: formEdicao.nome.trim(),
        cor: formEdicao.cor || null,
        icone: formEdicao.icone || null,
        orcamento_mensal: formEdicao.orcamento_mensal ? Number(formEdicao.orcamento_mensal) : null,
      })
      cancelarEdicao()
      carregarCategorias()
      toast('Categoria atualizada.', 'success')
    } catch (e) {
      toast(e.message || 'Erro ao atualizar', 'error')
    } finally {
      setEnviando(false)
    }
  }

  async function confirmarExcluir() {
    if (!modalExcluir.id) return
    setEnviando(true)
    try {
      await excluirCategoria(modalExcluir.id)
      setModalExcluir({ open: false, id: null })
      carregarCategorias()
      toast('Categoria excluída.', 'success')
    } catch (e) {
      toast(e.message || 'Erro ao excluir', 'error')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="configuracoes">
      <header className="page-header">
        <h1>Configurações</h1>
        <p>Preferências do app</p>
      </header>

      <div className="card">
        <div className="card-title">Aparência</div>
        <div className="configuracoes-lista">
          <div className="configuracoes-item">
            <label htmlFor="theme" className="configuracoes-label">
              Tema
            </label>
            <select
              id="theme"
              className="configuracoes-select"
              value={tema}
              onChange={handleTemaChange}
            >
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
            </select>
            <p className="configuracoes-hint">O tema escuro reduz o brilho e é aplicado em todo o app.</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Geral</div>
        <div className="configuracoes-lista">
          <div className="configuracoes-item">
            <label htmlFor="language" className="configuracoes-label">
              Idioma
            </label>
            <select
              id="language"
              className="configuracoes-select"
              value={idioma}
              onChange={(e) => setIdioma(e.target.value)}
            >
              <option value="pt-BR">Português (BR)</option>
              <option value="en-US">Inglês (US)</option>
            </select>
          </div>
          <div className="configuracoes-item">
            <label htmlFor="currency" className="configuracoes-label">
              Moeda
            </label>
            <select
              id="currency"
              className="configuracoes-select"
              value={moeda}
              onChange={(e) => setMoeda(e.target.value)}
            >
              <option value="BRL">Real (R$)</option>
              <option value="USD">Dólar (US$)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Categorias</div>
        <p className="configuracoes-hint" style={{ marginBottom: '1rem' }}>
          Crie categorias com ícones e cores para organizar seus gastos. Defina um orçamento mensal para cada categoria.
        </p>

        <form className="config-cat-form" onSubmit={handleCriarCategoria}>
          <input
            type="text"
            placeholder="Nome da categoria"
            value={formCategoria.nome}
            onChange={(e) => setFormCategoria((p) => ({ ...p, nome: e.target.value }))}
            className="config-cat-input"
            required
          />
          <div className="config-cat-picker">
            <label>Ícone:</label>
            <div className="config-cat-icons">
              {ICONES_DISPONIVEIS.map((i) => (
                <button
                  key={i}
                  type="button"
                  className={`config-cat-icon-btn ${formCategoria.icone === i ? 'active' : ''}`}
                  onClick={() => setFormCategoria((p) => ({ ...p, icone: p.icone === i ? '' : i }))}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div className="config-cat-picker">
            <label>Cor:</label>
            <div className="config-cat-colors">
              {CORES_DISPONIVEIS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`config-cat-color-btn ${formCategoria.cor === c ? 'active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setFormCategoria((p) => ({ ...p, cor: c }))}
                />
              ))}
            </div>
          </div>
          <input
            type="number"
            placeholder="Orçamento mensal (opcional)"
            value={formCategoria.orcamento_mensal}
            onChange={(e) => setFormCategoria((p) => ({ ...p, orcamento_mensal: e.target.value }))}
            className="config-cat-input"
            min="0"
            step="0.01"
          />
          <button type="submit" className="config-cat-btn" disabled={enviando}>
            {enviando ? 'Criando...' : 'Criar categoria'}
          </button>
        </form>

        {carregando ? (
          <p className="card-text">Carregando...</p>
        ) : categorias.length === 0 ? (
          <EmptyState
            icon="tag"
            title="Nenhuma categoria"
            description="Crie categorias para organizar melhor seus gastos."
          />
        ) : (
          <div className="config-cat-list">
            {categorias.map((cat) => (
              <div key={cat.id} className="config-cat-item">
                {editandoId === cat.id ? (
                  <div className="config-cat-edit">
                    <input
                      type="text"
                      value={formEdicao.nome}
                      onChange={(e) => setFormEdicao((p) => ({ ...p, nome: e.target.value }))}
                      className="config-cat-input"
                    />
                    <div className="config-cat-picker config-cat-picker-inline">
                      {ICONES_DISPONIVEIS.slice(0, 15).map((i) => (
                        <button
                          key={i}
                          type="button"
                          className={`config-cat-icon-btn config-cat-icon-btn-sm ${formEdicao.icone === i ? 'active' : ''}`}
                          onClick={() => setFormEdicao((p) => ({ ...p, icone: p.icone === i ? '' : i }))}
                        >
                          {i}
                        </button>
                      ))}
                    </div>
                    <div className="config-cat-picker config-cat-picker-inline">
                      {CORES_DISPONIVEIS.slice(0, 10).map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={`config-cat-color-btn config-cat-color-btn-sm ${formEdicao.cor === c ? 'active' : ''}`}
                          style={{ backgroundColor: c }}
                          onClick={() => setFormEdicao((p) => ({ ...p, cor: c }))}
                        />
                      ))}
                    </div>
                    <input
                      type="number"
                      placeholder="Orçamento mensal"
                      value={formEdicao.orcamento_mensal}
                      onChange={(e) => setFormEdicao((p) => ({ ...p, orcamento_mensal: e.target.value }))}
                      className="config-cat-input config-cat-input-sm"
                      min="0"
                      step="0.01"
                    />
                    <div className="config-cat-edit-actions">
                      <button type="button" className="config-cat-btn config-cat-btn-sm" onClick={salvarEdicao} disabled={enviando}>
                        Salvar
                      </button>
                      <button type="button" className="config-cat-btn config-cat-btn-secondary config-cat-btn-sm" onClick={cancelarEdicao}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="config-cat-info">
                      <div className="config-cat-icon-wrap" style={{ backgroundColor: cat.cor ? `${cat.cor}20` : undefined }}>
                        <span className="config-cat-icon-display">
                          {cat.icone || '📁'}
                        </span>
                        {cat.cor && <span className="config-cat-color-dot" style={{ backgroundColor: cat.cor }} />}
                      </div>
                      <div className="config-cat-details">
                        <span className="config-cat-name">
                          {cat.nome}
                        </span>
                        {cat.orcamento_mensal && (
                          <span className="config-cat-budget">
                            Orçamento: {formatarMoeda(cat.orcamento_mensal)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="config-cat-actions">
                      <button type="button" className="config-cat-action" onClick={() => iniciarEdicao(cat)} aria-label="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button type="button" className="config-cat-action config-cat-action-danger" onClick={() => setModalExcluir({ open: true, id: cat.id })} aria-label="Excluir">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={modalExcluir.open}
        title="Excluir categoria"
        message="Tem certeza que deseja excluir esta categoria? Os gastos não serão excluídos, apenas ficarão sem categoria."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        loading={enviando}
        onConfirm={confirmarExcluir}
        onCancel={() => setModalExcluir({ open: false, id: null })}
      />
    </div>
  )
}

export default Configuracoes
