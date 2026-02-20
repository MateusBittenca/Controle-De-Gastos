import { Link } from 'react-router-dom'
import './Legal.css'

function Privacidade() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/" className="legal-back">← Voltar para o início</Link>
        
        <h1>Política de Privacidade</h1>
        <p className="legal-updated">Última atualização: Fevereiro de 2026</p>

        <section>
          <h2>1. Introdução</h2>
          <p>
            A sua privacidade é importante para nós. Esta Política de Privacidade explica como o 
            Controle de Gastos ("nós", "nosso" ou "Serviço") coleta, usa, armazena e protege suas 
            informações pessoais.
          </p>
        </section>

        <section>
          <h2>2. Informações que Coletamos</h2>
          <h3>2.1 Informações fornecidas por você:</h3>
          <ul>
            <li><strong>Dados de cadastro:</strong> nome, e-mail e senha (armazenada de forma criptografada)</li>
            <li><strong>Dados financeiros:</strong> gastos, receitas, categorias e metas que você registra</li>
            <li><strong>Preferências:</strong> configurações de tema, idioma e moeda</li>
          </ul>
          
          <h3>2.2 Informações coletadas automaticamente:</h3>
          <ul>
            <li>Endereço IP e informações do navegador</li>
            <li>Data e hora de acesso</li>
            <li>Páginas visitadas dentro do Serviço</li>
          </ul>
        </section>

        <section>
          <h2>3. Como Usamos suas Informações</h2>
          <p>Utilizamos suas informações para:</p>
          <ul>
            <li>Fornecer, manter e melhorar o Serviço</li>
            <li>Processar e exibir seus dados financeiros</li>
            <li>Enviar notificações importantes sobre sua conta</li>
            <li>Responder a solicitações de suporte</li>
            <li>Detectar e prevenir fraudes ou abusos</li>
            <li>Cumprir obrigações legais</li>
          </ul>
        </section>

        <section>
          <h2>4. Compartilhamento de Dados</h2>
          <p>
            <strong>Não vendemos, alugamos ou compartilhamos seus dados pessoais ou financeiros 
            com terceiros para fins de marketing.</strong>
          </p>
          <p>Podemos compartilhar informações apenas:</p>
          <ul>
            <li>Com seu consentimento explícito</li>
            <li>Para cumprir obrigações legais</li>
            <li>Para proteger nossos direitos legais</li>
            <li>Com prestadores de serviços que nos auxiliam na operação do Serviço (sob acordos de confidencialidade)</li>
          </ul>
        </section>

        <section>
          <h2>5. Segurança dos Dados</h2>
          <p>Implementamos medidas de segurança para proteger seus dados:</p>
          <ul>
            <li>Senhas criptografadas com algoritmo bcrypt</li>
            <li>Conexões protegidas por HTTPS/TLS</li>
            <li>Autenticação via tokens JWT</li>
            <li>Acesso restrito aos dados por usuário</li>
            <li>Backups regulares do banco de dados</li>
          </ul>
        </section>

        <section>
          <h2>6. Retenção de Dados</h2>
          <p>
            Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário para 
            fornecer o Serviço. Você pode solicitar a exclusão de seus dados a qualquer momento 
            através das configurações da conta ou entrando em contato conosco.
          </p>
        </section>

        <section>
          <h2>7. Seus Direitos</h2>
          <p>Você tem direito a:</p>
          <ul>
            <li><strong>Acessar:</strong> visualizar todos os dados que temos sobre você</li>
            <li><strong>Corrigir:</strong> atualizar informações incorretas</li>
            <li><strong>Exportar:</strong> baixar seus dados em formato CSV</li>
            <li><strong>Excluir:</strong> solicitar a remoção completa de seus dados</li>
            <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado</li>
          </ul>
        </section>

        <section>
          <h2>8. Cookies e Armazenamento Local</h2>
          <p>
            Utilizamos armazenamento local (localStorage) para salvar suas preferências de tema 
            e token de autenticação. Não utilizamos cookies de rastreamento de terceiros.
          </p>
        </section>

        <section>
          <h2>9. Menores de Idade</h2>
          <p>
            O Serviço não é destinado a menores de 18 anos. Não coletamos intencionalmente 
            informações de menores. Se tomarmos conhecimento de que coletamos dados de um menor, 
            tomaremos medidas para excluir essas informações.
          </p>
        </section>

        <section>
          <h2>10. Alterações nesta Política</h2>
          <p>
            Podemos atualizar esta Política periodicamente. Notificaremos sobre alterações 
            significativas por e-mail ou através de um aviso no Serviço. Recomendamos revisar 
            esta página regularmente.
          </p>
        </section>

        <section>
          <h2>11. Contato</h2>
          <p>
            Para exercer seus direitos ou esclarecer dúvidas sobre esta Política, entre em 
            contato através da página de <Link to="/contato">Contato</Link>.
          </p>
        </section>

        <div className="legal-footer">
          <Link to="/termos">Termos de Uso</Link>
          <Link to="/contato">Contato</Link>
        </div>
      </div>
    </div>
  )
}

export default Privacidade
