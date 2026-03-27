"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

// Desconto anual: 2 meses grátis = 16,7% off
const DESCONTO_ANUAL = 10 / 12; // paga 10, leva 12

const planosBase = [
  {
    nome: "Starter",
    mensal: 0,
    descricao: "Para conhecer sem compromisso",
    economia: null,
    features: [
      "10 perguntas totais para experimentar",
      "Acesso a todos os 5 agentes",
      "Sem cartão de crédito necessário",
    ],
    cta: "Começar grátis",
    destaque: false,
    gratuito: true,
  },
  {
    nome: "Pro",
    mensal: 97,
    descricao: "Para quem quer economizar todo mês",
    economia: "Uma simulação de crédito bem feita já economiza R$500–2.000 em juros",
    features: [
      "Tudo do Starter, sem limite",
      "Simulador de Crédito ilimitado",
      "Taxas & Tarifas ilimitado",
      "Histórico de conversas",
      "R$3,23/dia — menos que um café",
    ],
    cta: "Assinar Pro",
    destaque: false,
    gratuito: false,
  },
  {
    nome: "Essencial",
    mensal: 197,
    descricao: "Para fazer o caixa render de verdade",
    economia: "Investir o caixa corretamente gera R$1k–5k/mês a mais que deixar na conta",
    features: [
      "Tudo do Pro",
      "Investimentos PJ ilimitado",
      "Relatórios em PDF profissional",
      "Comparativo de rendimento líquido",
      "Análise personalizada do seu setor",
    ],
    cta: "Assinar Essencial",
    destaque: true,
    gratuito: false,
  },
  {
    nome: "Profissional",
    mensal: 497,
    descricao: "Substitui consultoria de R$5k–20k/mês",
    economia: "Empresas pagam R$5k–20k/mês por consultoria financeira presencial",
    features: [
      "Tudo do Essencial",
      "Open Finance (conexão bancária real)",
      "Dashboard financeiro completo",
      "Suporte prioritário por WhatsApp",
      "Consultoria humana mensal (1h)",
    ],
    cta: "Assinar Profissional",
    destaque: false,
    gratuito: false,
  },
];

function formatPreco(valor: number) {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function PlanosSection() {
  const [anual, setAnual] = useState(false);

  return (
    <section id="planos" className="py-20 px-5 md:px-8 bg-white">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Planos</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900">Cada plano se paga sozinho</h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">
            O retorno de uma única decisão financeira bem feita já cobre meses de assinatura. Sem fidelidade, sem multa.
          </p>

          {/* Toggle mensal / anual */}
          <div className="flex items-center justify-center gap-3 mt-7">
            <span className={`text-sm font-medium ${!anual ? "text-gray-900" : "text-gray-400"}`}>Mensal</span>
            <button
              onClick={() => setAnual(!anual)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${anual ? "bg-[#1B2A4A]" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${anual ? "translate-x-6" : ""}`} />
            </button>
            <span className={`text-sm font-medium ${anual ? "text-gray-900" : "text-gray-400"}`}>
              Anual
            </span>
            {anual && (
              <span className="bg-green-100 text-green-700 text-[11px] font-bold px-2.5 py-1 rounded-full animate-pulse">
                2 meses grátis
              </span>
            )}
          </div>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {planosBase.map((p) => {
            const precoMensal = p.gratuito ? 0 : p.mensal;
            const precoAnualTotal = p.gratuito ? 0 : Math.round(p.mensal * 10); // paga 10 meses
            const precoAnualMes = p.gratuito ? 0 : Math.round(p.mensal * 10 / 12);
            const economia = p.gratuito ? 0 : p.mensal * 2; // 2 meses grátis

            return (
              <div
                key={p.nome}
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

                <h3 className={`font-bold text-base ${p.destaque ? "text-white" : "text-gray-900"}`}>{p.nome}</h3>
                <p className={`text-[11px] mt-0.5 ${p.destaque ? "text-blue-300" : "text-gray-400"}`}>{p.descricao}</p>

                {/* Preço */}
                <div className="my-4">
                  {p.gratuito ? (
                    <div>
                      <span className={`text-3xl font-black ${p.destaque ? "text-white" : "text-gray-900"}`}>Grátis</span>
                      <span className={`text-xs ml-1 ${p.destaque ? "text-blue-300" : "text-gray-400"}`}>para sempre</span>
                    </div>
                  ) : anual ? (
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-3xl font-black ${p.destaque ? "text-white" : "text-gray-900"}`}>
                          R${formatPreco(precoAnualMes)}
                        </span>
                        <span className={`text-xs ${p.destaque ? "text-blue-300" : "text-gray-400"}`}>/mês</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[11px] line-through ${p.destaque ? "text-blue-400/60" : "text-gray-400"}`}>
                          R${formatPreco(precoMensal)}/mês
                        </span>
                        <span className="text-[10px] font-bold text-green-500">
                          -{Math.round((1 - precoAnualMes / precoMensal) * 100)}%
                        </span>
                      </div>
                      <p className={`text-[11px] mt-1 ${p.destaque ? "text-blue-300/70" : "text-gray-400"}`}>
                        R${formatPreco(precoAnualTotal)}/ano · economiza R${formatPreco(economia)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className={`text-3xl font-black ${p.destaque ? "text-white" : "text-gray-900"}`}>
                        R${formatPreco(precoMensal)}
                      </span>
                      <span className={`text-xs ml-1 ${p.destaque ? "text-blue-300" : "text-gray-400"}`}>/mês</span>
                    </div>
                  )}
                </div>

                {/* Por que vale a pena */}
                {p.economia && (
                  <div className={`text-[11px] px-3 py-2 rounded-lg mb-4 leading-snug ${
                    p.destaque ? "bg-blue-500/20 text-blue-200" : "bg-green-50 text-green-700"
                  }`}>
                    <span className="font-semibold">Por que vale a pena:</span> {p.economia}
                  </div>
                )}

                {/* Features */}
                <ul className="space-y-2 mb-5 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle size={13} className={`flex-shrink-0 mt-0.5 ${p.destaque ? "text-blue-400" : "text-green-500"}`} />
                      <span className={`text-[12px] leading-tight ${p.destaque ? "text-blue-100" : "text-gray-600"}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/cadastro"
                  className={`block w-full text-center py-2.5 rounded-xl font-bold text-sm transition-all ${
                    p.destaque
                      ? "bg-white text-[#1B2A4A] hover:bg-blue-50"
                      : "bg-[#1B2A4A] text-white hover:bg-[#243660]"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Métodos de pagamento */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-500">Formas de pagamento:</span>
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">Cartão de crédito</span>
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">Pix</span>
          </div>
          <span className="hidden sm:block text-gray-300">·</span>
          <span>Renovação automática · Cancele quando quiser</span>
        </div>
      </div>
    </section>
  );
}
