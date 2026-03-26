"use client";

import Link from "next/link";
import { AlertTriangle, Zap, ArrowRight, Clock } from "lucide-react";

export default function PlanoExpiradoPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={28} className="text-red-500" />
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">
          Seu plano expirou
        </h1>
        <p className="text-[14px] text-gray-500 leading-relaxed mb-6">
          Identificamos um problema com o pagamento da sua assinatura.
          Para continuar usando os modulos exclusivos, regularize sua situacao.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
          <div className="flex items-start gap-3">
            <Clock size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-amber-800">O que acontece agora?</p>
              <p className="text-[12px] text-amber-700 mt-1 leading-relaxed">
                Os modulos exclusivos do seu plano ficam bloqueados ate a regularizacao.
                Seus dados e historico estao seguros e serao restaurados assim que o pagamento for confirmado.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/upgrade"
            className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-[#1B2A4A] text-white text-sm rounded-xl hover:bg-[#243660] transition-colors font-bold shadow-lg"
          >
            <Zap size={15} />
            Renovar assinatura
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/dashboard"
            className="block text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Continuar com plano Starter (gratuito)
          </Link>
        </div>

        <p className="text-[11px] text-gray-400 mt-8">
          Duvidas? Entre em contato pelo{" "}
          <a href="mailto:suporte@meugerentepj.com.br" className="text-blue-500 hover:underline">
            suporte@meugerentepj.com.br
          </a>
        </p>
      </div>
    </div>
  );
}
