"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Eye, EyeOff, Sparkles, CheckCircle2 } from "lucide-react";

export default function ResetarSenhaPage() {
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [erro, setErro] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Supabase sets the session automatically via the URL hash
    const supabase = createClient();
    supabase.auth.getSession();
  }, []);

  async function handleRedefinir(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });

    if (error) {
      setErro("Não foi possível redefinir a senha. O link pode ter expirado. Tente solicitar um novo.");
      setCarregando(false);
      return;
    }

    setConcluido(true);
    setTimeout(() => router.push("/dashboard"), 2000);
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
          <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center font-bold text-white text-lg mx-auto mb-4 shadow-xl shadow-blue-900/40">
            GP
          </div>
          <h1 className="text-xl font-bold text-white">Meu Gerente PJ</h1>
          <div className="flex items-center justify-center gap-1.5 mt-1.5">
            <Sparkles size={12} className="text-blue-300" />
            <p className="text-sm text-blue-300">Consultor Financeiro com IA</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 p-7">
          {concluido ? (
            <div className="text-center py-2">
              <CheckCircle2 size={44} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-[15px] font-bold text-gray-900 mb-2">Senha redefinida!</h2>
              <p className="text-sm text-gray-500">Redirecionando para o dashboard...</p>
            </div>
          ) : (
            <>
              <h2 className="text-[15px] font-bold text-gray-900 mb-1">Nova senha</h2>
              <p className="text-sm text-gray-500 mb-5">Escolha uma nova senha para sua conta.</p>

              <form onSubmit={handleRedefinir} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nova senha</label>
                  <div className="relative">
                    <input
                      type={verSenha ? "text" : "password"}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                      placeholder="Mínimo 6 caracteres"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar senha</label>
                  <input
                    type="password"
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    required
                    placeholder="Repita a nova senha"
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
                  disabled={carregando || !senha || !confirmar}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2 rounded-xl text-[15px]"
                >
                  {carregando && <Loader2 size={16} className="animate-spin" />}
                  {carregando ? "Salvando..." : "Redefinir senha"}
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
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
