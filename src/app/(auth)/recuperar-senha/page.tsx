"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/resetar-senha`,
    });

    if (error) {
      setErro("Não foi possível enviar o email. Verifique o endereço e tente novamente.");
      setCarregando(false);
      return;
    }

    setEnviado(true);
    setCarregando(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] via-[#1e3060] to-[#0f1d36] flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
        backgroundSize: "32px 32px"
      }} />

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-pj.svg" alt="Meu Gerente PJ" className="w-16 h-16 object-contain mx-auto mb-4 drop-shadow-2xl" />
          <h1 className="text-xl font-bold text-white">Meu Gerente PJ</h1>
          <div className="flex items-center justify-center gap-1.5 mt-1.5">
            <Sparkles size={12} className="text-blue-300" />
            <p className="text-sm text-blue-300">Consultor Financeiro com IA</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 p-7">
          {enviado ? (
            <div className="text-center py-2">
              <CheckCircle2 size={44} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-[15px] font-bold text-gray-900 mb-2">Email enviado!</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Enviamos um link de recuperação para <strong>{email}</strong>. Verifique sua caixa de entrada e spam.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline font-medium"
              >
                <ArrowLeft size={14} />
                Voltar para o login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-[15px] font-bold text-gray-900 mb-1">Recuperar senha</h2>
              <p className="text-sm text-gray-500 mb-5">Digite seu email e enviaremos um link para redefinir sua senha.</p>

              <form onSubmit={handleEnviar} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="seu@email.com"
                    className="input-base"
                  />
                </div>

                {erro && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    {erro}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={carregando || !email}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2 rounded-xl text-[15px]"
                >
                  {carregando && <Loader2 size={16} className="animate-spin" />}
                  {carregando ? "Enviando..." : "Enviar link de recuperação"}
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft size={13} />
                  Voltar para o login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
