import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Contato.css'

function Contato() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    assunto: 'duvida',
    mensagem: ''
  })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    
    // Simula envio (em produção, integrar com backend ou serviço de email)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setEnviando(false)
    setEnviado(true)
    setFormData({ nome: '', email: '', assunto: 'duvida', mensagem: '' })
  }

  return (
    <div className="contato-page">
      <div className="contato-container">
        <Link to="/" className="contato-back">← Voltar para o início</Link>

        <div className="contato-header">
          <h1>Entre em Contato</h1>
          <p>Tem alguma dúvida, sugestão ou precisa de ajuda? Estamos aqui para ajudar!</p>
        </div>

        <div className="contato-content">
          <div className="contato-info">
            <div className="contato-info-item">
              <div className="contato-info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div>
                <h3>E-mail</h3>
                <p>suporte@controledegastos.com</p>
              </div>
            </div>

            <div className="contato-info-item">
              <div className="contato-info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div>
                <h3>Tempo de Resposta</h3>
                <p>Até 24 horas úteis</p>
              </div>
            </div>

            <div className="contato-info-item">
              <div className="contato-info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div>
                <h3>Suporte</h3>
                <p>Segunda a Sexta, 9h às 18h</p>
              </div>
            </div>
          </div>

          <form className="contato-form" onSubmit={handleSubmit}>
            {enviado ? (
              <div className="contato-sucesso">
                <div className="contato-sucesso-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <h3>Mensagem Enviada!</h3>
                <p>Obrigado pelo contato. Responderemos em breve.</p>
                <button 
                  type="button" 
                  className="contato-nova-msg"
                  onClick={() => setEnviado(false)}
                >
                  Enviar nova mensagem
                </button>
              </div>
            ) : (
              <>
                <div className="contato-form-row">
                  <div className="contato-form-group">
                    <label htmlFor="nome">Nome</label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>

                  <div className="contato-form-group">
                    <label htmlFor="email">E-mail</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="contato-form-group">
                  <label htmlFor="assunto">Assunto</label>
                  <select
                    id="assunto"
                    name="assunto"
                    value={formData.assunto}
                    onChange={handleChange}
                    required
                  >
                    <option value="duvida">Dúvida</option>
                    <option value="sugestao">Sugestão</option>
                    <option value="problema">Relatar Problema</option>
                    <option value="comercial">Comercial/Parcerias</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div className="contato-form-group">
                  <label htmlFor="mensagem">Mensagem</label>
                  <textarea
                    id="mensagem"
                    name="mensagem"
                    value={formData.mensagem}
                    onChange={handleChange}
                    placeholder="Descreva sua dúvida ou sugestão em detalhes..."
                    rows="5"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="contato-submit"
                  disabled={enviando}
                >
                  {enviando ? (
                    <>
                      <span className="contato-spinner"></span>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                      Enviar Mensagem
                    </>
                  )}
                </button>
              </>
            )}
          </form>
        </div>

        <div className="contato-footer-links">
          <Link to="/termos">Termos de Uso</Link>
          <Link to="/privacidade">Política de Privacidade</Link>
        </div>
      </div>
    </div>
  )
}

export default Contato
