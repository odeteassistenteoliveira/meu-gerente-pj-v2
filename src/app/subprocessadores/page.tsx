import Link from "next/link";

export const metadata = {
  title: "Subprocessadores — Meu Gerente PJ",
  description: "Lista de subprocessadores que tratam dados pessoais em nome do Meu Gerente PJ.",
};

const subprocessadores = [
  {
    nome: "Supabase (Supabase Inc.)",
    funcao: "Banco de dados, autenticação e armazenamento",
    dados: "Email, senha (hash), CNPJ, CPF (criptografados), dados da empresa, sessões de chat",
    local: "EUA (AWS us-east-1)",
    conformidade: "SOC 2 Type II, GDPR compliant",
    url: "https://supabase.com/privacy",
  },
  {
    nome: "Google Gemini (Google LLC)",
    funcao: "Processamento de linguagem natural (IA generativa)",
    dados: "Mensagens do chat, contexto da empresa (setor, faturamento)",
    local: "EUA",
    conformidade: "ISO 27001, SOC 1/2/3, GDPR",
    url: "https://ai.google.dev/terms",
  },
  {
    nome: "Asaas (Asaas Gestão Financeira S.A.)",
    funcao: "Processamento de pagamentos e cobranças",
    dados: "Nome, email, CPF/CNPJ, dados de cobrança",
    local: "Brasil",
    conformidade: "PCI DSS, LGPD",
    url: "https://www.asaas.com/politica-de-privacidade",
  },
  {
    nome: "Resend (Resend Inc.)",
    funcao: "Envio de emails transacionais",
    dados: "Email, nome da empresa",
    local: "EUA",
    conformidade: "SOC 2, GDPR",
    url: "https://resend.com/legal/privacy-policy",
  },
  {
    nome: "Vercel (Vercel Inc.)",
    funcao: "Hospedagem da aplicação e CDN",
    dados: "IP do visitante, logs de acesso",
    local: "Global (edge network)",
    conformidade: "SOC 2 Type II, GDPR",
    url: "https://vercel.com/legal/privacy-policy",
  },
  {
    nome: "Pluggy (Pluggy Tecnologia Ltda.) — Fase 2",
    funcao: "Open Finance — conexão com contas bancárias",
    dados: "Extratos bancários, saldos (quando autorizado pelo usuário)",
    local: "Brasil",
    conformidade: "Regulação BCB Open Finance, LGPD",
    url: "https://pluggy.ai/privacy",
  },
];

export default function SubprocessadoresPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
          &larr; Voltar ao início
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Subprocessadores</h1>
        <p className="text-sm text-gray-500 mb-8">
          O Meu Gerente PJ utiliza os seguintes serviços terceirizados (subprocessadores) para operar a plataforma.
          Cada subprocessador trata dados pessoais exclusivamente para a finalidade descrita e possui suas
          próprias políticas de privacidade e conformidade.
        </p>

        <p className="text-xs text-gray-400 mb-6">
          Última atualização: março de 2026 · Versão 1.0
        </p>

        <div className="space-y-4">
          {subprocessadores.map((sp) => (
            <div key={sp.nome} className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 text-sm mb-2">{sp.nome}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                <div><span className="font-semibold text-gray-500">Função:</span> {sp.funcao}</div>
                <div><span className="font-semibold text-gray-500">Localização:</span> {sp.local}</div>
                <div className="sm:col-span-2"><span className="font-semibold text-gray-500">Dados tratados:</span> {sp.dados}</div>
                <div><span className="font-semibold text-gray-500">Conformidade:</span> {sp.conformidade}</div>
                <div>
                  <a href={sp.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Política de privacidade
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-xs text-gray-600">
            <strong>Nota:</strong> Em caso de adição ou alteração de subprocessadores, os usuários serão notificados
            com antecedência mínima de 15 dias, conforme Art. 39 da LGPD. Dúvidas podem ser enviadas para{" "}
            <a href="mailto:privacidade@meugerentepj.com.br" className="text-blue-600 hover:underline">
              privacidade@meugerentepj.com.br
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
