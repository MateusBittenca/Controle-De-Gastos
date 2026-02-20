import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getMe, updateMe } from '../api/auth'
import './Usuario.css'

function formatarDataISO(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function Usuario() {
  const { user: userContext, updateUser } = useAuth()
  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [editando, setEditando] = useState(false)
  const [nome, setNome] = useState('')
  const [metaGastos, setMetaGastos] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [salvandoMeta, setSalvandoMeta] = useState(false)
  const { toast } = useToast()
  const location = useLocation()
  const metaSectionRef = useRef(null)

  useEffect(() => {
    if (location.state?.scrollToMeta && metaSectionRef.current) {
      metaSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.state])

  useEffect(() => {
    getMe()
      .then((data) => {
        setPerfil(data)
        setNome(data.nome)
        setMetaGastos(data.meta_gastos_mes != null ? String(data.meta_gastos_mes) : '')
      })
      .catch((e) => setErro(e.detail?.detail ?? e.message ?? 'Erro ao carregar perfil.'))
      .finally(() => setCarregando(false))
  }, [])

  function handleSalvarMeta(e) {
    e.preventDefault()
    setSalvandoMeta(true)
    setErro(null)
    const valor = metaGastos.trim() === '' ? null : Number(metaGastos)
    updateMe({ meta_gastos_mes: valor })
      .then((data) => {
        setPerfil(data)
        setMetaGastos(data.meta_gastos_mes != null ? String(data.meta_gastos_mes) : '')
        toast('Meta salva.', 'success')
      })
      .catch((e) => {
        setErro(e.detail?.detail ?? e.message ?? 'Erro ao salvar.')
        toast(e.detail?.detail ?? e.message ?? 'Erro ao salvar.', 'error')
      })
      .finally(() => setSalvandoMeta(false))
  }

  function handleSalvar(e) {
    e.preventDefault()
    if (!nome.trim()) return
    setSalvando(true)
    setErro(null)
    updateMe({ nome: nome.trim() })
      .then((data) => {
        setPerfil(data)
        setNome(data.nome)
        setEditando(false)
        updateUser({ nome: data.nome })
        toast('Nome atualizado.', 'success')
      })
      .catch((e) => {
        setErro(e.detail?.detail ?? e.message ?? 'Erro ao salvar.')
        toast(e.detail?.detail ?? e.message ?? 'Erro ao salvar.', 'error')
      })
      .finally(() => setSalvando(false))
  }

  if (carregando) {
    return (
      <div className="usuario">
        <header className="page-header">
          <h1>Usuário</h1>
          <p>Seu perfil</p>
        </header>
        <p className="usuario-loading">Carregando...</p>
      </div>
    )
  }

  if (erro && !perfil) {
    return (
      <div className="usuario">
        <header className="page-header">
          <h1>Usuário</h1>
          <p>Seu perfil</p>
        </header>
        <div className="card card-erro">
          <p className="card-text">{erro}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="usuario">
      <header className="page-header">
        <h1>Usuário</h1>
        <p>Seu perfil</p>
      </header>

      {erro && (
        <div className="card card-erro usuario-erro">
          <p className="card-text">{erro}</p>
        </div>
      )}

      <div className="card usuario-card">
        <div className="card-title">Dados do perfil</div>
        {!editando ? (
          <div className="usuario-dados">
            <div className="usuario-campo">
              <span className="usuario-label">Nome</span>
              <span className="usuario-valor">{perfil?.nome ?? userContext?.nome}</span>
            </div>
            <div className="usuario-campo">
              <span className="usuario-label">E-mail</span>
              <span className="usuario-valor">{perfil?.email ?? userContext?.email}</span>
            </div>
            {perfil?.criado_em && (
              <div className="usuario-campo">
                <span className="usuario-label">Membro desde</span>
                <span className="usuario-valor">{formatarDataISO(perfil.criado_em)}</span>
              </div>
            )}
            <button type="button" className="usuario-btn-editar" onClick={() => setEditando(true)}>
              Editar nome
            </button>
          </div>
        ) : (
          <form onSubmit={handleSalvar} className="usuario-form">
            <div className="usuario-field">
              <label htmlFor="usuario-nome" className="usuario-label">Nome</label>
              <input
                id="usuario-nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="usuario-input"
                required
              />
            </div>
            <div className="usuario-form-actions">
              <button type="submit" className="usuario-btn usuario-btn-primary" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                className="usuario-btn usuario-btn-secondary"
                onClick={() => { setEditando(false); setNome(perfil?.nome ?? ''); setErro(null); }}
                disabled={salvando}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      <div id="meta-gastos" ref={metaSectionRef} className="card usuario-card">
        <div className="card-title">Meta de gastos do mês</div>
        <p className="usuario-meta-desc">Defina um limite para seus gastos mensais. O Dashboard mostrará o progresso.</p>
        <form onSubmit={handleSalvarMeta} className="usuario-form usuario-meta-form">
          <div className="usuario-field">
            <label htmlFor="usuario-meta" className="usuario-label">Valor (R$)</label>
            <input
              id="usuario-meta"
              type="number"
              step="0.01"
              min="0"
              value={metaGastos}
              onChange={(e) => setMetaGastos(e.target.value)}
              placeholder="Ex: 3000"
              className="usuario-input"
            />
          </div>
          <button type="submit" className="usuario-btn usuario-btn-primary" disabled={salvandoMeta}>
            {salvandoMeta ? 'Salvando...' : 'Salvar meta'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Usuario
