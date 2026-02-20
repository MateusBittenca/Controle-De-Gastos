import { Link } from 'react-router-dom'
import './Legal.css'

function Termos() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/" className="legal-back">← Voltar para o início</Link>
        
        <h1>Termos de Uso</h1>
        <p className="legal-updated">Última atualização: Fevereiro de 2026</p>

        <section>
          <h2>1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e utilizar o Controle de Gastos ("Serviço"), você concorda em cumprir e estar 
            vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, 
            não poderá acessar o Serviço.
          </p>
        </section>

        <section>
          <h2>2. Descrição do Serviço</h2>
          <p>
            O Controle de Gastos é uma plataforma de gestão financeira pessoal que permite aos usuários:
          </p>
          <ul>
            <li>Registrar e categorizar gastos e receitas</li>
            <li>Configurar gastos e receitas recorrentes</li>
            <li>Definir metas e orçamentos por categoria</li>
            <li>Visualizar relatórios e análises financeiras</li>
            <li>Exportar dados em formato CSV</li>
          </ul>
        </section>

        <section>
          <h2>3. Cadastro e Conta</h2>
          <p>
            Para utilizar o Serviço, você deve criar uma conta fornecendo informações verdadeiras e 
            completas. Você é responsável por manter a confidencialidade de sua senha e por todas as 
            atividades que ocorram em sua conta.
          </p>
          <p>
            Você concorda em notificar imediatamente sobre qualquer uso não autorizado de sua conta 
            ou qualquer outra violação de segurança.
          </p>
        </section>

        <section>
          <h2>4. Uso Aceitável</h2>
          <p>Você concorda em não:</p>
          <ul>
            <li>Usar o Serviço para qualquer finalidade ilegal</li>
            <li>Tentar acessar contas de outros usuários</li>
            <li>Interferir ou interromper o Serviço ou servidores</li>
            <li>Transmitir vírus ou código malicioso</li>
            <li>Coletar informações de outros usuários sem consentimento</li>
          </ul>
        </section>

        <section>
          <h2>5. Propriedade Intelectual</h2>
          <p>
            O Serviço e seu conteúdo original, recursos e funcionalidades são de propriedade exclusiva 
            do Controle de Gastos e estão protegidos por leis de direitos autorais, marcas registradas 
            e outras leis de propriedade intelectual.
          </p>
        </section>

        <section>
          <h2>6. Seus Dados</h2>
          <p>
            Você mantém todos os direitos sobre os dados que inserir no Serviço. Concedemos a você a 
            capacidade de exportar seus dados a qualquer momento. Não vendemos, compartilhamos ou 
            utilizamos seus dados financeiros para fins de marketing.
          </p>
        </section>

        <section>
          <h2>7. Limitação de Responsabilidade</h2>
          <p>
            O Serviço é fornecido "como está" e "conforme disponível". Não garantimos que o Serviço 
            será ininterrupto, seguro ou livre de erros. O Controle de Gastos não se responsabiliza 
            por decisões financeiras tomadas com base nas informações exibidas no Serviço.
          </p>
        </section>

        <section>
          <h2>8. Modificações</h2>
          <p>
            Reservamo-nos o direito de modificar ou substituir estes Termos a qualquer momento. 
            Alterações significativas serão notificadas com antecedência razoável. O uso continuado 
            do Serviço após alterações constitui aceitação dos novos termos.
          </p>
        </section>

        <section>
          <h2>9. Encerramento</h2>
          <p>
            Podemos encerrar ou suspender sua conta imediatamente, sem aviso prévio, por qualquer 
            motivo, incluindo, sem limitação, violação destes Termos. Você pode encerrar sua conta 
            a qualquer momento excluindo-a nas configurações.
          </p>
        </section>

        <section>
          <h2>10. Contato</h2>
          <p>
            Se você tiver dúvidas sobre estes Termos, entre em contato conosco através da 
            página de <Link to="/contato">Contato</Link>.
          </p>
        </section>

        <div className="legal-footer">
          <Link to="/privacidade">Política de Privacidade</Link>
          <Link to="/contato">Contato</Link>
        </div>
      </div>
    </div>
  )
}

export default Termos
