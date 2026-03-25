"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Calculator, CreditCard, Building2, TrendingUp, Landmark,
  ArrowRight, Sparkles, MessageSquare
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const modulos = [
  {
    href: "/calculadora",
    label: "Calculadora Financeira",
    icon: Calculator,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    border: "border-blue-100 hover:border-blue-200",
    badgeBg: "bg-blue-50 text-blue-600",
    badgeLabel: "Juros & Fluxo",
    desc: "Calcule juros compostos, antecipação de recebíveis, ponto de equilíbrio e capital de giro.",
    exemplo: "Se parcelar em 10x, quanto pago a mais no total?",
  },
  {
    href: "/credito",
    label: "Simulador de Crédito",
    icon: CreditCard,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50",
    border: "border-purple-100 hover:border-purple-200",
    badgeBg: "bg-purple-50 text-purple-600",
    badgeLabel: "Sem viés bancário",
    desc: "Compare BNDES, Pronampe e capital de giro. Veja o CET real de cada linha disponível.",
    exemplo: "Preciso de R\$150k para equipamento — qual a linha mais barata?",
  },
  {
    href: "/taxas",
    label: "Taxas & Tarifas",
    icon: TrendingUp,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-50",
    border: "border-orange-100 hover:border-orange-200",
    badgeBg: "bg-orange-50 text-orange-600",
    badgeLabel: "Maquininha & Conta PJ",
    desc: "Descubra se está pagando caro na maquininha, conta PJ, Pix ou boleto.",
    exemplo: "Pago 2,99% no crédito — isso é caro ou dentro do mercado?",
  },
  {
    href: "/bancario",
    label: "Especialista Bancário",
    icon: Landmark,
    iconColor: "text-green-600",
    iconBg: "bg-green-50",
    border: "border-green-100 hover:border-green-200",
    badgeBg: "bg-green-50 text-green-600",
    badgeLabel: "Regras do Bacen",
    desc: "Horários de TED, compensação de boleto, dias úteis, limites de Pix e regras de câmbio.",
    exemplo: "Se pagar o boleto hoje às 18h, compensa amanhã?",
  },
  {
    href: "/investimentos",
    label: "Investimentos PJ",
    icon: Building2,
    iconColor: "text-teal-600",
    iconBg: "bg-teal-50",
    border: "border-teal-100 hover:border-teal-200",
    badgeBg: "bg-teal-50 text-teal-600",
    badgeLabel: "IR já calculado",
    desc: "Compare CDB, Tesouro Direto, LCI e LCA com rendimento líquido real já descontado o IR.",
    exemplo: "Tenho R\$80k parado na conta PJ — onde rende mais com liquidez?",
  },
];

function getSaudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function DashboardPage() {
  const [nomeEmpresa, setNomeEmpresa] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("empresas").select("nome_fantasia").eq("user_id", user.id).single();
      if (data?.nome_fantasia) setNomeEmpresa(data.nome_fantasia);
    }
    load();
  }, []);

  const primeiroNome = nomeEmpresa ? nomeEmpresa.split(" ")[0] : "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero strip */}
      <div className="bg-[#1B2A4A] px-6 md:px-10 pt-8 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-blue-200 text-xs font-medium px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Consultor disponível agora
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            {getSaudacao()}{primeiroNome ? `, ${primeiroNome}` : ""}!
          </h1>
          <p className="text-blue-300 mt-1.5 text-sm md:text-[15px]">
            Escolha um especialista abaixo — cada um domina profundamente o seu tema.
          </p>
        </div>
      </div>

      {/* Cards sobrepostos ao hero */}
      <div className="px-5 md:px-10 max-w-5xl mx-auto -mt-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {modulos.map((m, i) => {
            const isLastOdd = i === modulos.length - 1 && modulos.length % 2 !== 0;
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`module-card group bg-white rounded-2xl border ${m.border} p-5 block shadow-sm${isLastOdd ? " md:col-span-2 md:max-w-[calc(50%-6px)]" : ""}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${m.iconBg}`}>
                    <m.icon size={18} className={m.iconColor} />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${m.badgeBg}`}>
                    {m.badgeLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-bold text-[14px] text-gray-900">{m.label}</h3>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>
                <p className="text-[13px] text-gray-500 leading-relaxed mb-3">{m.desc}</p>
                <div className="flex items-start gap-1.5 pt-2.5 border-t border-gray-100">
                  <MessageSquare size={11} className="text-gray-300 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-gray-400 italic leading-relaxed">"{m.exemplo}"</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Dica */}
        <div className="mt-3 mb-8 bg-white border border-gray-100 rounded-2xl p-4 flex gap-3 items-start shadow-sm">
          <div className="w-8 h-8 bg-[#1B2A4A] rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles size={13} className="text-blue-300" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-gray-800">Dica do Gerente</p>
            <p className="text-[13px] text-gray-500 mt-0.5 leading-relaxed">
              Fale de forma natural, como faria com um consultor de confiança. Mencione valores reais, prazos e o que precisa decidir — quanto mais contexto, melhor a resposta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
