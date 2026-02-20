import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { registro as apiRegistro } from '../api/auth'
import './Login.css'

const IconUser = () => (
  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const IconMail = () => (
  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const IconLock = () => (
  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const IconCheck = () => (
  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
)

const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

const IconAlert = () => (
  <svg className="auth-erro-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

function calcularForcaSenha(senha) {
  if (!senha) return { nivel: 0, texto: '', classe: '' }
  let pontos = 0
  if (senha.length >= 6) pontos++
  if (senha.length >= 8) pontos++
  if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) pontos++
  if (/\d/.test(senha)) pontos++
  if (/[^a-zA-Z0-9]/.test(senha)) pontos++
  if (pontos <= 1) return { nivel: 1, texto: 'Fraca', classe: 'fraca' }
  if (pontos <= 2) return { nivel: 2, texto: 'Razoável', classe: 'razoavel' }
  if (pontos <= 3) return { nivel: 3, texto: 'Boa', classe: 'boa' }
  return { nivel: 4, texto: 'Forte', classe: 'forte' }
}

function Cadastro() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const forca = useMemo(() => calcularForcaSenha(senha), [senha])
  const senhasConferem = confirmar.length > 0 && senha === confirmar

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    if (senha !== confirmar) {
      setErro('As senhas não coincidem.')
      return
    }
    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    setLoading(true)
    try {
      const res = await apiRegistro(nome.trim(), email.trim(), senha)
      login(res.access_token, res.user)
      navigate('/app/dashboard')
    } catch (err) {
      setErro(err.detail?.detail ?? err.message ?? 'Erro ao cadastrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Criar conta</h1>
          <p className="auth-subtitle">Comece a organizar suas finanças agora</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {erro && (
            <div className="auth-erro">
              <IconAlert />
              <span>{erro}</span>
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="cad-nome">Nome</label>
            <div className="auth-input-wrap">
              <IconUser />
              <input
                id="cad-nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                autoComplete="name"
                placeholder="Como quer ser chamado"
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="cad-email">E-mail</label>
            <div className="auth-input-wrap">
              <IconMail />
              <input
                id="cad-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="cad-senha">Senha</label>
            <div className="auth-input-wrap">
              <IconLock />
              <input
                id="cad-senha"
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                className="auth-toggle-senha"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarSenha ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
            {senha.length > 0 && (
              <div className="auth-senha-forca">
                <div className="auth-senha-barra">
                  <div
                    className={`auth-senha-barra-fill auth-senha-${forca.classe}`}
                    style={{ width: `${(forca.nivel / 4) * 100}%` }}
                  />
                </div>
                <span className={`auth-senha-texto auth-senha-${forca.classe}`}>
                  {forca.texto}
                </span>
              </div>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="cad-confirmar">Confirmar senha</label>
            <div className={`auth-input-wrap ${senhasConferem ? 'auth-input-sucesso' : ''}`}>
              <IconCheck />
              <input
                id="cad-confirmar"
                type={mostrarConfirmar ? 'text' : 'password'}
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Repita a senha"
              />
              <button
                type="button"
                className="auth-toggle-senha"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                aria-label={mostrarConfirmar ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarConfirmar ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
            {confirmar.length > 0 && !senhasConferem && (
              <span className="auth-hint auth-hint-erro">As senhas não coincidem</span>
            )}
            {senhasConferem && (
              <span className="auth-hint auth-hint-sucesso">Senhas coincidem</span>
            )}
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="app-spinner auth-spinner" />
                <span>Cadastrando...</span>
              </>
            ) : (
              <span>Criar minha conta</span>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>ou</span>
        </div>

        <p className="auth-link">
          Já tem conta?{' '}
          <Link to="/login" className="auth-link-btn">
            Entrar
          </Link>
        </p>

        <div className="auth-footer">
          <Link to="/" className="auth-back">← Voltar ao início</Link>
          <div className="auth-trust">
            <IconShield />
            <span>Dados protegidos</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cadastro
