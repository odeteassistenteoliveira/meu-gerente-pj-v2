"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Eye, EyeOff, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

    if (error) {
      setErro("Email ou senha incorretos. Verifique e tente novamente.");
      setCarregando(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] via-[#1e3060] to-[#0f1d36] flex items-center justify-center px-4 py-8">
      {/* Background pattern */}
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

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 p-7">
          <h2 className="text-[15px] font-bold text-gray-900 mb-6">Entrar na sua conta</h2>

          <form onSubmit={handleLogin} className="space-y-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={verSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-base pr-10"
                />
                <button
                  type="button"
                  onClick={() => setVerSenha(!verSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {verSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
                <span className="text-red-400 mt-0.5">!</span>
                <span>{erro}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={carregando || !email || !senha}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 rounded-xl text-[15px]"
            >
              {carregando && <Loader2 size={16} className="animate-spin" />}
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-5 space-y-3 text-center">
            <Link
              href="/recuperar-senha"
              className="block text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Esqueci minha senha
            </Link>
            <p className="text-sm text-gray-500">
              Ainda não tem conta?{" "}
              <Link href="/cadastro" className="text-blue-600 font-semibold hover:underline">
                Criar conta grátis
              </Link>
            </p>
          </div>
        </div>

        {/* Rodapé */}
        <p className="text-center text-xs text-blue-400/60 mt-6">
          Gerente com 20+ anos de experiência · CEA & CFP
        </p>
      </div>
    </div>
  );
}
