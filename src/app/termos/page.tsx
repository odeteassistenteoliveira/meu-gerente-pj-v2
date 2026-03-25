import Link from "next/link";
import { Scale } from "lucide-react";

export const metadata = {
  title: "Termos de Uso e Privacidade | Meu Gerente PJ",
  description:
    "Termos de Uso, Política de Privacidade e tratamento de dados do Meu Gerente PJ, em conformidade com a LGPD.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 border-b-2 border-blue-600 pb-2 mb-4">
        {title}
      </h2>
      <div className="space-y-3 text-sm text-gray-700 leading-relaxed">{children}</div>
    </section>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
      {children}
    </div>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="text-blue-500 mt-0.5 shrink-0">•</span>
      <span>{children}</span>
    </li>
  );
}

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 text-sm leading-relaxed">
      ⚠️ {children}
    </div>
  );
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B2A4A] to-[#1e3060] py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Scale size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Termos de Uso e Privacidade</h1>
          <p className="text-blue-300 text-sm mt-2">
            Versão 1.0 · Março de 2025 · Em conformidade com a LGPD
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* Intro */}
          <p className="text-sm text-gray-600 leading-relaxed mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
            Este documento estabelece as condições de uso da plataforma <strong>Meu Gerente PJ</strong>,
            os direitos e obrigações do Usuário e da Empresa, e a forma como os dados pessoais e
            financeiros são tratados, em conformidade com a <strong>Lei Geral de Proteção de Dados
            (LGPD — Lei nº 13.709/2018)</strong>.
          </p>

          {/* PARTE I */}
          <h2 className="text-xl font-bold text-[#1B2A4A] mb-6 pb-3 border-b border-gray-200">
            Parte I — Termos de Uso
          </h2>

          <Section title="1. Identificação das Partes">
            <ul className="space-y-2">
              <Li><strong>Plataforma:</strong> meu-gerente-pj.vercel.app, serviço de consultoria financeira
                com inteligência artificial voltado para empresas de pequeno porte.</Li>
              <Li><strong>Usuário:</strong> pessoa física ou jurídica que se cadastra e utiliza os serviços da Plataforma.</Li>
            </ul>
          </Section>

          <Section title="2. Objeto">
            <p>
              O Meu Gerente PJ disponibiliza um ambiente digital de consultoria financeira orientada por
              inteligência artificial, com funcionalidades que incluem: análise de fluxo de caixa, gestão
              de cobranças e recebimentos, indicadores financeiros, simulações, relatórios e atendimento
              por assistente virtual especializado em finanças empresariais.
            </p>
            <p className="mt-2">
              Os serviços são fornecidos em formato SaaS (Software como Serviço), mediante assinatura
              mensal, conforme plano escolhido pelo Usuário.
            </p>
          </Section>

          <Section title="3. Aceite dos Termos">
            <p>
              Ao criar uma conta, acessar ou utilizar qualquer funcionalidade da Plataforma, o Usuário
              declara ter lido, compreendido e concordado integralmente com estes Termos e com a
              Política de Privacidade.
            </p>
            <Alert>
              O aceite eletrônico registrado no momento do cadastro tem a mesma validade jurídica
              de uma assinatura manuscrita, nos termos do art. 10, §2º, da MP nº 2.200-2/2001.
              A Plataforma registra data, hora, endereço IP e versão dos Termos aceitos.
            </Alert>
          </Section>

          <Section title="4. Planos e Condições Comerciais">
            <Sub title="4.1 Planos disponíveis">
              <p>Os planos disponíveis, com valores e benefícios, estão descritos na página de preços.
                A Plataforma pode alterar os planos com aviso prévio mínimo de 30 dias.</p>
            </Sub>
            <Sub title="4.2 Pagamento e renovação">
              <ul className="space-y-1 mt-1">
                <Li>Assinaturas cobradas mensalmente via cartão ou boleto, processados pela Asaas.</Li>
                <Li>Renovação automática ao final de cada período, salvo cancelamento com 5 dias úteis de antecedência.</Li>
                <Li>Inadimplência implica suspensão temporária, reativada após regularização.</Li>
              </ul>
            </Sub>
            <Sub title="4.3 Cancelamento e reembolso">
              <ul className="space-y-1 mt-1">
                <Li>Cancelamento disponível a qualquer momento pelo painel da conta.</Li>
                <Li>Sem reembolso proporcional, exceto direito de arrependimento em 7 dias (art. 49 do CDC).</Li>
              </ul>
            </Sub>
          </Section>

          <Section title="5. Obrigações do Usuário">
            <ul className="space-y-1">
              <Li>Fornecer informações verdadeiras e atualizadas.</Li>
              <Li>Manter a confidencialidade das credenciais de acesso.</Li>
              <Li>Não compartilhar login com terceiros não autorizados.</Li>
              <Li>Não utilizar a Plataforma para fins ilícitos ou fraudulentos.</Li>
              <Li>Comunicar imediatamente qualquer acesso não autorizado à conta.</Li>
              <Li>Utilizar as orientações da IA como subsídio informativo, não como aconselhamento regulamentado.</Li>
            </ul>
          </Section>

          <Section title="6. Natureza do Serviço e Isenção de Responsabilidade">
            <Sub title="6.1 Caráter informativo das orientações da IA">
              <p className="mb-2">
                O assistente virtual utiliza inteligência artificial para análises e recomendações financeiras.
                Tais orientações têm caráter <strong>exclusivamente informativo e educacional</strong>, não constituindo:
              </p>
              <ul className="space-y-1">
                <Li>Consultoria de investimentos regulamentada (CVM/ANCORD);</Li>
                <Li>Assessoria financeira ou de crédito (Banco Central);</Li>
                <Li>Auditoria contábil, fiscal ou tributária;</Li>
                <Li>Aconselhamento jurídico.</Li>
              </ul>
            </Sub>
            <Alert>
              AVISO IMPORTANTE: Todas as decisões de negócio são de responsabilidade exclusiva do Usuário.
              Para decisões de alto impacto financeiro, recomenda-se consultar profissionais habilitados
              (contador, advogado, consultor financeiro certificado).
            </Alert>
            <Sub title="6.2 Limitação de responsabilidade">
              <p>A Plataforma não se responsabiliza por perdas decorrentes de decisões baseadas nas análises
                da IA, erros em dados fornecidos pelo Usuário, indisponibilidade temporária do serviço
                ou acessos não autorizados resultantes de negligência do Usuário com suas credenciais.</p>
            </Sub>
          </Section>

          <Section title="7. Acesso Multi-Usuário (Plano Premium)">
            <ul className="space-y-1">
              <Li>O titular (Administrador) é responsável por todos os usuários convidados.</Li>
              <Li>Cada usuário adicional deve aceitar individualmente estes Termos no primeiro acesso.</Li>
              <Li>O Administrador define níveis de permissão por perfil (visualizador, financeiro, admin).</Li>
              <Li>Encerramento da conta principal cancela todos os acessos vinculados.</Li>
            </ul>
          </Section>

          <Section title="8. Propriedade Intelectual">
            <p>Todos os direitos sobre a Plataforma, interface, algoritmos, marca e código pertencem
              ao Meu Gerente PJ. É vedada reprodução ou engenharia reversa sem consentimento prévio.</p>
            <p className="mt-2">Os dados financeiros inseridos pelo Usuário permanecem de sua propriedade.
              A Plataforma não reivindica direitos sobre os dados de negócio do Usuário.</p>
          </Section>

          <Section title="9. Suspensão e Encerramento">
            <p className="mb-2">A Plataforma pode suspender ou encerrar o acesso em casos de:</p>
            <ul className="space-y-1">
              <Li>Violação destes Termos;</Li>
              <Li>Inadimplência superior a 30 dias;</Li>
              <Li>Uso fraudulento ou abusivo;</Li>
              <Li>Determinação judicial ou de autoridade competente.</Li>
            </ul>
          </Section>

          <Section title="10. Foro e Lei Aplicável">
            <p>Regido pelas leis da República Federativa do Brasil. Foro eleito: Comarca de São Paulo/SP.</p>
          </Section>

          {/* PARTE II */}
          <h2 className="text-xl font-bold text-[#1B2A4A] mt-10 mb-6 pb-3 border-b border-gray-200">
            Parte II — Política de Privacidade
          </h2>

          <Section title="11. Dados Coletados">
            <Sub title="11.1 Fornecidos pelo Usuário">
              <ul className="space-y-1 mt-1">
                <Li>Identificação: nome, CPF/CNPJ, e-mail, telefone.</Li>
                <Li>Dados da empresa: razão social, setor, faturamento declarado, regime tributário.</Li>
                <Li>Dados de pagamento: processados pela Asaas — não armazenamos dados de cartão.</Li>
                <Li>Dados financeiros: cobranças, recebimentos e demais informações inseridas na Plataforma.</Li>
              </ul>
            </Sub>
            <Sub title="11.2 Coletados automaticamente">
              <ul className="space-y-1 mt-1">
                <Li>Endereço IP, navegador, sistema operacional, data e hora de acesso.</Li>
                <Li>Páginas visitadas, funcionalidades utilizadas, tempo de sessão.</Li>
                <Li>Cookies de autenticação e funcionamento do serviço.</Li>
              </ul>
            </Sub>
          </Section>

          <Section title="12. Finalidade do Tratamento">
            <ul className="space-y-1">
              <Li>Prestação do serviço contratado (análises, relatórios, assistente de IA).</Li>
              <Li>Processamento de cobranças e gestão da assinatura.</Li>
              <Li>Comunicações sobre o serviço e suporte.</Li>
              <Li>Melhoria da Plataforma com dados <strong>anonimizados</strong> — nunca identificados.</Li>
              <Li>Cumprimento de obrigações legais e regulatórias.</Li>
            </ul>
            <Alert>
              Os dados financeiros do Usuário NUNCA são utilizados para treinar modelos de IA de
              forma identificada. Qualquer uso ocorre exclusivamente com dados anonimizados e agregados.
            </Alert>
          </Section>

          <Section title="13. Base Legal (LGPD)">
            <ul className="space-y-1">
              <Li><strong>Art. 7º, V</strong> — Execução de contrato: dados necessários à prestação do serviço.</Li>
              <Li><strong>Art. 7º, VI</strong> — Obrigação legal: cumprimento de deveres regulatórios.</Li>
              <Li><strong>Art. 7º, IX</strong> — Legítimo interesse: melhoria da Plataforma.</Li>
              <Li><strong>Art. 7º, I</strong> — Consentimento: comunicações de marketing, quando aplicável.</Li>
            </ul>
          </Section>

          <Section title="14. Compartilhamento de Dados">
            <ul className="space-y-1">
              <Li><strong>Asaas:</strong> processamento de pagamentos e assinaturas.</Li>
              <Li><strong>Supabase:</strong> infraestrutura de banco de dados com criptografia em repouso.</Li>
              <Li><strong>Anthropic (Claude AI):</strong> processamento do assistente virtual.</Li>
              <Li><strong>Autoridades:</strong> quando exigido por lei ou ordem judicial.</Li>
            </ul>
            <p className="mt-3 font-medium text-gray-800">
              A Plataforma NÃO vende, aluga ou compartilha dados com terceiros para fins comerciais.
            </p>
          </Section>

          <Section title="15. Segurança e Armazenamento">
            <ul className="space-y-1">
              <Li>Criptografia em repouso e em trânsito (TLS).</Li>
              <Li>Isolamento de dados por empresa (Row Level Security).</Li>
              <Li>Autenticação segura com hash de senhas (bcrypt).</Li>
              <Li>Monitoramento de acessos e backups automáticos (retenção de 30 dias).</Li>
            </ul>
          </Section>

          <Section title="16. Retenção de Dados">
            <ul className="space-y-1">
              <Li>Dados financeiros e de negócio: até 5 anos após encerramento (fins legais/fiscais).</Li>
              <Li>Dados de identificação: excluídos/anonimizados em até 90 dias após encerramento.</Li>
              <Li>Logs de acesso: até 6 meses para fins de segurança.</Li>
              <Li>Registro de aceite dos Termos: mantido indefinidamente para fins legais.</Li>
            </ul>
          </Section>

          <Section title="17. Direitos do Titular (LGPD, Art. 18)">
            <p className="mb-2">O Usuário pode, a qualquer momento, solicitar:</p>
            <ul className="space-y-1">
              <Li>Confirmação e acesso aos dados tratados.</Li>
              <Li>Correção de dados incompletos ou desatualizados.</Li>
              <Li>Eliminação, portabilidade ou anonimização dos dados.</Li>
              <Li>Revogação do consentimento.</Li>
              <Li>Informações sobre compartilhamento com terceiros.</Li>
            </ul>
            <p className="mt-3">
              Solicitações via <strong>contato@meu-gerente-pj.com.br</strong> — respondidas em até 15 dias úteis.
            </p>
          </Section>

          <Section title="18. Contato e DPO">
            <ul className="space-y-1">
              <Li>Geral: <strong>contato@meu-gerente-pj.com.br</strong></Li>
              <Li>Privacidade/DPO: <strong>privacidade@meu-gerente-pj.com.br</strong></Li>
              <Li>ANPD: <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:underline">www.gov.br/anpd</a></Li>
            </ul>
          </Section>

        </div>

        {/* Rodapé */}
        <div className="text-center mt-6 text-xs text-gray-400 space-y-1">
          <p>Meu Gerente PJ · meu-gerente-pj.vercel.app</p>
          <p>Versão 1.0 — Março de 2025</p>
          <Link href="/cadastro" className="text-blue-500 hover:underline inline-block mt-2">
            ← Voltar para o cadastro
          </Link>
        </div>
      </div>
    </div>
  );
}
