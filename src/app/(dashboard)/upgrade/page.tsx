"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Zap, ArrowRight, Loader2, Lock } from "lucide-react";

const planos = [
  {
    slug: "pro",
    nome: "Pro",
    mensal: 97,
    anual: 970,
    descricao: "Para quem quer economizar todo mês",
    economia: "Uma simulação de crédito bem feita já economiza R$500–2.000 em juros",
    features: [
      "Tudo do Starter, sem limite",
      "Simulador de Crédito ilimitado",
      "Taxas & Tarifas ilimitado",
      "Histórico de conversas",
      "R$3,23/dia — menos que um café",
    ],
    destaque: false,
  },
  {
    slug: "essencial",
    nome: "Essencial",
    mensal: 197,
    anual: 1970,
    descricao: "Para fazer o caixa render de verdade",
    economia: "Investir o caixa corretamente gera R$1k–5k/mês a mais que deixar na conta",
    features: [
      "Tudo do Pro",
      "Investimentos PJ ilimitado",
      "Relatórios em PDF profissional",
      "Comparativo de rendimento líquido",
      "Análise personalizada do seu setor",
    ],
    destaque: true,
  },
  {
    slug: "profissional",
    nome: "Profissional",
    mensal: 497,
    anual: 4970,
    descricao: "Substitui consultoria de R$5k–20k/mês",
    economia: "Empresas pagam R$5k–20k/mês por consultoria financeira presencial",
    features: [
      "Tudo do Essencial",
      "Open Finance (conexão bancária real)",
      "Dashboard financeiro completo",
      "Suporte prioritário por WhatsApp",
      "Consultoria humana mensal (1h)",
    ],
    destaque: false,
  },
];

function formatPreco(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 0 });
}

const MODULO_NOMES: Record<string, string> = {
  credito: "Simulador de Crédito",
  taxas: "Taxas & Tarifas",
  investimentos: "Investimentos PJ",
};

function UpgradeContent() {
  const [ciclo, setCiclo] = useState<"mensal" | "anual">("mensal");
  const [loading, setLoading] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduloBloqueado = searchParams.get("modulo");

  async function handleAssinar(slug: string) {
    setLoading(slug);
    setErro(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plano: slug, ciclo }),
      });
      const data = await res.json();

      if (!res.ok || !data.paymentUrl) {
        if (data.cnpjAusente) {
          setErro("Preencha seu CNPJ no perfil antes de assinar. Acesse Configurações → Perfil.");
        } else {
          setErro(data.error ?? "Erro ao iniciar pagamento. Tente novamente.");
        }
        setLoading(null);
        return;
      }

      // Redireciona para a página de pagamento do Asaas
      window.location.href = data.paymentUrl;
    } catch {
      setErro("Falha de conexão. Tente novamente.");
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Zap size={11} />
            Upgrade de plano
          </div>
          <h1 className="text-3xl font-black text-gray-900">Escolha seu plano</h1>
          <p className="text-gray-500 mt-2 text-sm">Cancele quando quiser · Sem fidelidade · Sem multa</p>

          {moduloBloqueado && MODULO_NOMES[moduloBloqueado] && (
            <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium px-4 py-2.5 rounded-xl">
              <Lock size={14} />
              O módulo <strong>{MODULO_NOMES[moduloBloqueado]}</strong> requer um plano superior
            </div>
          )}

          {/* Toggle mensal / anual */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-sm font-medium ${ciclo === "mensal" ? "text-gray-900" : "text-gray-400"}`}>
              Mensal
            </span>
            <button
              onClick={() => setCiclo(ciclo === "mensal" ? "anual" : "mensal")}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                ciclo === "anual" ? "bg-[#1B2A4A]" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  ciclo === "anual" ? "translate-x-6" : ""
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${ciclo === "anual" ? "text-gray-900" : "text-gray-400"}`}>
              Anual
            </span>
            {ciclo === "anual" && (
              <span className="bg-green-100 text-green-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                2 meses grátis
              </span>
            )}
          </div>
        </div>

        {/* Erro global */}
        {erro && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl text-center">
            {erro}
          </div>
        )}

        {/* Cards de planos */}
        <div className="grid sm:grid-cols-3 gap-4">
          {planos.map((p) => {
            const precoMes = ciclo === "anual"
              ? Math.round(p.anual / 12)
              : p.mensal;
            const desconto = ciclo === "anual"
              ? Math.round((1 - precoMes / p.mensal) * 100)
              : 0;

            return (
              <div
                key={p.slug}
                className={`rounded-2xl p-5 border flex flex-col ${
                  p.destaque
                    ? "bg-[#1B2A4A] border-[#1B2A4A] shadow-xl shadow-[#1B2A4A]/20 ring-2 ring-blue-400/30"
                    : "bg-white border-gray-200"
                }`}
              >
                {p.destaque && (
                  <span className="inline-block bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3 self-start">
                    Mais popular
                  </span>
                )}

                <h3 className={`font-bold text-base ${p.destaque ? "text-white" : "text-gray-900"}`}>
                  {p.nome}
                </h3>
                <p className={`text-[11px] mt-0.5 ${p.destaque ? "text-blue-300" : "text-gray-400"}`}>
                  {p.descricao}
                </p>

                {/* Preço */}
                <div className="my-4">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-black ${p.destaque ? "text-white" : "text-gray-900"}`}>
                      R${formatPreco(precoMes)}
                    </span>
                    <span className={`text-xs ${p.destaque ? "text-blue-300" : "text-gray-400"}`}>/mês</span>
                  </div>
                  {ciclo === "anual" && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[11px] line-through ${p.destaque ? "text-blue-400/60" : "text-gray-400"}`}>
                        R${formatPreco(p.mensal)}/mês
                      </span>
                      <span className="text-[10px] font-bold text-green-500">-{desconto}%</span>
                    </div>
                  )}
                  {ciclo === "anual" && (
                    <p className={`text-[11px] mt-1 ${p.destaque ? "text-blue-300/70" : "text-gray-400"}`}>
                      R${formatPreco(p.anual)}/ano · economiza R${formatPreco(p.mensal * 2)}
                    </p>
                  )}
                </div>

                {/* Por que vale a pena */}
                <div className={`text-[11px] px-3 py-2 rounded-lg mb-4 leading-snug ${
                  p.destaque ? "bg-blue-500/20 text-blue-200" : "bg-green-50 text-green-700"
                }`}>
                  <span className="font-semibold">Por que vale:</span> {p.economia}
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-5 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle
                        size={13}
                        className={`flex-shrink-0 mt-0.5 ${p.destaque ? "text-blue-400" : "text-green-500"}`}
                      />
                      <span className={`text-[12px] leading-tight ${p.destaque ? "text-blue-100" : "text-gray-600"}`}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Botão */}
                <button
                  onClick={() => handleAssinar(p.slug)}
                  disabled={loading !== null}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60 ${
                    p.destaque
                      ? "bg-white text-[#1B2A4A] hover:bg-blue-50"
                      : "bg-[#1B2A4A] text-white hover:bg-[#243660]"
                  }`}
                >
                  {loading === p.slug ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      Assinar {p.nome}
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Formas de pagamento */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-500">Formas de pagamento:</span>
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">Cartão de crédito</span>
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">Pix</span>
          </div>
          <span className="hidden sm:block text-gray-300">·</span>
          <span>Renovação automática · Cancele quando quiser</span>
        </div>

        {/* Voltar */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Voltar ao dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <UpgradeContent />
    </Suspense>
  );
}
