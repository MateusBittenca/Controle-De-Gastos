import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Landing.css'

const IconChart = () => (
  <svg className="landing-feature-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const IconPie = () => (
  <svg className="landing-feature-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
)

const IconShield = () => (
  <svg className="landing-feature-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const IconTarget = () => (
  <svg className="landing-feature-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

const features = [
  {
    icon: <IconChart />,
    title: 'Dashboard intuitivo',
    description: 'Veja gastos, receitas e saldo do mês em um só lugar. Filtre por período e acompanhe sua meta.',
  },
  {
    icon: <IconPie />,
    title: 'Relatórios e categorias',
    description: 'Gráficos por categoria, evolução mensal e exportação em CSV para análise no Excel ou planilhas.',
  },
  {
    icon: <IconShield />,
    title: 'Seus dados protegidos',
    description: 'Login seguro com senha criptografada. Cada usuário acessa apenas suas próprias informações.',
  },
  {
    icon: <IconTarget />,
    title: 'Meta de gastos',
    description: 'Defina um limite mensal e acompanhe o progresso para manter as finanças sob controle.',
  },
]

const faqItems = [
  {
    pergunta: 'O Controle de Gastos é realmente gratuito?',
    resposta: 'Sim! O Controle de Gastos é 100% gratuito. Não há taxas escondidas, período de teste ou necessidade de cartão de crédito para usar todas as funcionalidades.'
  },
  {
    pergunta: 'Meus dados financeiros estão seguros?',
    resposta: 'Absolutamente. Utilizamos criptografia bcrypt para senhas, conexões HTTPS, e cada usuário acessa apenas seus próprios dados. Não vendemos nem compartilhamos suas informações com terceiros.'
  },
  {
    pergunta: 'Posso acessar pelo celular?',
    resposta: 'Sim! O sistema é totalmente responsivo e funciona em qualquer dispositivo. Você também pode instalar como um app no celular através do navegador (PWA).'
  },
  {
    pergunta: 'Posso exportar meus dados?',
    resposta: 'Sim, você pode exportar todos os seus gastos e receitas em formato CSV a qualquer momento, permitindo análise em Excel ou outras ferramentas.'
  },
  {
    pergunta: 'Como funcionam os gastos recorrentes?',
    resposta: 'Você cadastra despesas fixas como aluguel, internet, streaming, etc., e o sistema gera automaticamente os lançamentos no dia configurado. O mesmo vale para receitas recorrentes como salário.'
  },
  {
    pergunta: 'Posso criar categorias personalizadas?',
    resposta: 'Sim! Você pode criar quantas categorias quiser, definir cores e ícones para cada uma, e até estabelecer um orçamento mensal por categoria.'
  }
]

function FAQItem({ pergunta, resposta }) {
  const [aberto, setAberto] = useState(false)
  
  return (
    <div className={`faq-item ${aberto ? 'faq-item-aberto' : ''}`}>
      <button
        type="button"
        className="faq-pergunta"
        onClick={() => setAberto(!aberto)}
        aria-expanded={aberto}
      >
        <span>{pergunta}</span>
        <svg 
          className="faq-icon" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points={aberto ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
        </svg>
      </button>
      <div className="faq-resposta" aria-hidden={!aberto}>
        <p>{resposta}</p>
      </div>
    </div>
  )
}

function Landing() {
  return (
    <div className="landing">
      <header className="landing-header">
        <Link to="/" className="landing-logo">
          <span className="landing-logo-text">Controle de gastos</span>
        </Link>
        <nav className="landing-nav" aria-label="Navegação principal">
          <Link to="/login" className="landing-nav-btn">Entrar</Link>
          <Link to="/cadastro" className="landing-nav-btn landing-nav-btn-primary">Cadastrar</Link>
        </nav>
      </header>

      <main className="landing-main">
        <section className="landing-hero" aria-labelledby="landing-heading">
          <span className="landing-badge">100% gratuito · Sem cartão</span>
          <h1 id="landing-heading" className="landing-title">
            Organize suas finanças de forma simples
          </h1>
          <p className="landing-subtitle">
            Acompanhe gastos e receitas, defina metas e veja relatórios em um só lugar. Feito para quem quer clareza sem complicação.
          </p>
          <div className="landing-cta">
            <Link to="/cadastro" className="landing-cta-btn landing-cta-btn-primary">
              Começar grátis
            </Link>
            <Link to="/login" className="landing-cta-btn landing-cta-btn-outline">
              Já tenho conta
            </Link>
          </div>
        </section>

        <section className="landing-features-section" aria-labelledby="landing-features-title">
          <h2 id="landing-features-title" className="landing-features-heading">Tudo que você precisa</h2>
          <div className="landing-features-grid">
            {features.map((feat, i) => (
              <article key={i} className="landing-feature-card">
                <div className="landing-feature-icon-wrap">{feat.icon}</div>
                <h3 className="landing-feature-title">{feat.title}</h3>
                <p className="landing-feature-desc">{feat.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-faq-section" aria-labelledby="faq-title">
          <h2 id="faq-title" className="landing-faq-heading">Perguntas Frequentes</h2>
          <div className="landing-faq-list">
            {faqItems.map((item, i) => (
              <FAQItem key={i} pergunta={item.pergunta} resposta={item.resposta} />
            ))}
          </div>
        </section>

        <section className="landing-cta-section">
          <p className="landing-cta-section-text">Pronto para começar?</p>
          <Link to="/cadastro" className="landing-cta-btn landing-cta-btn-primary landing-cta-btn-large">
            Criar minha conta
          </Link>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <span className="landing-footer-brand">Controle de gastos</span>
          <div className="landing-footer-links">
            <Link to="/login">Entrar</Link>
            <Link to="/cadastro">Cadastrar</Link>
            <Link to="/termos">Termos de Uso</Link>
            <Link to="/privacidade">Privacidade</Link>
            <Link to="/contato">Contato</Link>
          </div>
          <p className="landing-footer-copy">© {new Date().getFullYear()} · Seus dados ficam sob seu controle</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
