"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";

const setores = [
  { value: "comercio", label: "Comércio" },
  { value: "servicos", label: "Serviços" },
  { value: "industria", label: "Indústria" },
  { value: "agronegocio", label: "Agronegócio" },
  { value: "tecnologia", label: "Tecnologia" },
  { value: "saude", label: "Saúde" },
  { value: "construcao", label: "Construção" },
  { value: "outro", label: "Outro" },
];

const faixasFaturamento = [
  { value: 1000000, label: "Até R\$1MM/ano" },
  { value: 3000000, label: "R\$1MM a R\$3MM/ano" },
  { value: 10000000, label: "R\$3MM a R\$10MM/ano" },
  { value: 30000000, label: "R\$10MM a R\$30MM/ano" },
];

export default function CadastroPage() {
  const [etapa, setEtapa] = useState<"conta" | "empresa" | "pronto">("conta");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [termosAceitos, setTermosAceitos] = useState(false);

  const [nomeFantasia, setNomeFantasia] = useState("");
  const [setor, setSetor] = useState("servicos");
  const [faturamento, setFaturamento] = useState(3000000);
  const [regime, setRegime] = useState("simples_nacional");

  async function handleCriarConta(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password: senha });

    if (error) {
      setErro(error.message.includes("already registered")
        ? "Este email já está cadastrado."
        : "Erro ao criar conta. Tente novamente.");
      setCarregando(false);
      return;
    }

    // Registra aceite dos termos com IP via API server-side
    try {
      await fetch("/api/aceite-termos", { method: "POST" });
    } catch {
      // Não bloqueia o fluxo se falhar — tentará novamente no próximo login
      console.warn("Aviso: não foi possível registrar aceite dos termos.");
    }

    // Garante sessão ativa após signup (mailer_autoconfirm=true mas sessão não é automática)
    await supabase.auth.signInWithPassword({ email, password: senha });
    setCarregando(false);
    setEtapa("empresa");
  }

  async function handleSalvarEmpresa(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setErro("Sessão expirada. Faça login novamente.");
      setCarregando(false);
      return;
    }

    const { error } = await supabase.from("empresas").insert({
      user_id: user.id,
      nome_fantasia: nomeFantasia,
      setor,
      faturamento_anual: faturamento,
      regime_tributario: regime,
      plano: "starter",
    });

    if (error) {
      setErro("Erro ao salvar os dados da empresa. Tente novamente.");
      setCarregando(false);
      return;
    }

    setCarregando(false);
    setEtapa("pronto");
    setTimeout(() => router.push("/dashboard"), 2500);
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
        <div className="text-center mb-7">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center font-bold text-white text-lg mx-auto mb-4 shadow-xl shadow-blue-900/40">
            GP
          </div>
          <h1 className="text-xl font-bold text-white">Meu Gerente PJ</h1>
          <div className="flex items-center justify-center gap-1.5 mt-1.5">
            <Sparkles size={12} className="text-blue-300" />
            <p className="text-sm text-blue-300">Comece grátis — sem cartão</p>
          </div>
        </div>

        {/* Indicador de etapa */}
        {etapa !== "pronto" && (
          <div className="flex items-center justify-center gap-2 mb-5">
            {(["conta", "empresa"] as const).map((e, i) => (
              <div key={e} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold transition-all ${
                  etapa === e
                    ? "bg-white text-[#1B2A4A] shadow-md"
                    : etapa === "empresa" && e === "conta"
                    ? "bg-green-400 text-white"
                    : "bg-white/15 text-white/50"
                }`}>
                  {etapa === "empresa" && e === "conta" ? "✓" : i + 1}
                </div>
                <span className={`text-xs font-medium ${etapa === e ? "text-white" : "text-blue-300/60"}`}>
                  {e === "conta" ? "Sua conta" : "Sua empresa"}
                </span>
                {i === 0 && <div className="w-8 h-px bg-white/20 mx-1" />}
              </div>
            ))}
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 p-7">

          {/* Etapa 1: Conta */}
          {etapa === "conta" && (
            <>
              <h2 className="text-[15px] font-bold text-gray-900 mb-5">Criar sua conta</h2>
              <form onSubmit={handleCriarConta} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seu@email.com"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    className="input-base"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">Mínimo de 6 caracteres</p>
                </div>
                {/* Aceite dos Termos */}
                <div className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                  termosAceitos
                    ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50 border-gray-200"
                }`}>
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input
                      type="checkbox"
                      id="termos"
                      checked={termosAceitos}
                      onChange={(e) => setTermosAceitos(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer accent-blue-600"
                    />
                  </div>
                  <label htmlFor="termos" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                    Li e aceito os{" "}
                    <Link
                      href="/termos"
                      target="_blank"
                      className="text-blue-600 font-semibold hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Termos de Uso e Política de Privacidade
                    </Link>
                    , incluindo o tratamento dos meus dados conforme a LGPD e o caráter{" "}
                    informativo (não regulamentado) das orientações do assistente financeiro.
                  </label>
                </div>

                {/* Aviso se não aceitou */}
                {!termosAceitos && email && senha && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    <ShieldCheck size={14} className="shrink-0" />
                    Aceite os Termos de Uso para continuar.
                  </div>
                )}

                {erro && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    {erro}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={carregando || !email || !senha || !termosAceitos}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2 rounded-xl text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {carregando && <Loader2 size={16} className="animate-spin" />}
                  {carregando ? "Criando conta..." : "Continuar"}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-5">
                Já tem conta?{" "}
                <Link href="/login" className="text-blue-600 font-semibold hover:underline">Entrar</Link>
              </p>
            </>
          )}

          {/* Etapa 2: Empresa */}
          {etapa === "empresa" && (
            <>
              <h2 className="text-[15px] font-bold text-gray-900 mb-1">Conte sobre sua empresa</h2>
              <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                Isso ajuda a personalizar as respostas do consultor para o seu perfil.
              </p>
              <form onSubmit={handleSalvarEmpresa} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome da empresa</label>
                  <input
                    type="text"
                    value={nomeFantasia}
                    onChange={(e) => setNomeFantasia(e.target.value)}
                    required
                    placeholder="Nome fantasia ou razão social"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Setor de atuação</label>
                  <select value={setor} onChange={(e) => setSetor(e.target.value)} className="input-base">
                    {setores.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Faturamento anual</label>
                  <select value={faturamento} onChange={(e) => setFaturamento(Number(e.target.value))} className="input-base">
                    {faixasFaturamento.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Regime tributário</label>
                  <select value={regime} onChange={(e) => setRegime(e.target.value)} className="input-base">
                    <option value="mei">MEI</option>
                    <option value="simples_nacional">Simples Nacional</option>
                    <option value="lucro_presumido">Lucro Presumido</option>
                    <option value="lucro_real">Lucro Real</option>
                  </select>
                </div>
                {erro && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    {erro}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={carregando || !nomeFantasia}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2 rounded-xl text-[15px]"
                >
                  {carregando && <Loader2 size={16} className="animate-spin" />}
                  {carregando ? "Salvando..." : "Acessar o Gerente PJ"}
                </button>
              </form>
            </>
          )}

          {/* Etapa 3: Pronto */}
          {etapa === "pronto" && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={36} className="text-green-500" />
              </div>
              <h2 className="font-bold text-gray-900 text-lg mb-2">Tudo pronto!</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Seu Gerente PJ está configurado e pronto para te ajudar.
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-4">
                <Loader2 size={13} className="animate-spin text-gray-400" />
                <p className="text-xs text-gray-400">Abrindo o painel...</p>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-blue-400/60 mt-6">
          Gerente com 20+ anos de experiência · CEA & CFP
        </p>
      </div>
    </div>
  );
}
