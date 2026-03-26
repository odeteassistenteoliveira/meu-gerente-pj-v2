"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle2, Sparkles, Eye, EyeOff, ChevronRight } from "lucide-react";

/* ── Dados de formulário ─────────────────────────── */
const setores = [
  { value: "comercio",    label: "Comércio / Varejo" },
  { value: "servicos",    label: "Prestação de Serviços" },
  { value: "industria",   label: "Indústria / Manufatura" },
  { value: "agronegocio", label: "Agronegócio" },
  { value: "tecnologia",  label: "Tecnologia / SaaS" },
  { value: "saude",       label: "Saúde / Farmácia" },
  { value: "construcao",  label: "Construção Civil" },
  { value: "educacao",    label: "Educação" },
  { value: "outro",       label: "Outro" },
];

const faixasFaturamento = [
  { value: 1000000,  label: "Até R$1MM / ano" },
  { value: 3000000,  label: "R$1MM a R$3MM / ano" },
  { value: 10000000, label: "R$3MM a R$10MM / ano" },
  { value: 30000000, label: "R$10MM a R$30MM / ano" },
];

const opcoesDesafios = [
  "Controle de fluxo de caixa",
  "Acesso a crédito com juros baixos",
  "Taxas altas de maquininha/banco",
  "Onde investir o caixa da empresa",
  "Planejamento tributário",
  "Gestão de capital de giro",
];

const opcoesComoConheceu = [
  "Google / pesquisa",
  "Instagram / Facebook",
  "LinkedIn",
  "Indicação de amigo",
  "Contador / consultor",
  "Outro",
];

const numFuncionarios = [
  { value: "1",     label: "Só eu (MEI / sócio)" },
  { value: "2-5",   label: "2 a 5 funcionários" },
  { value: "6-20",  label: "6 a 20 funcionários" },
  { value: "21-50", label: "21 a 50 funcionários" },
  { value: "50+",   label: "Mais de 50 funcionários" },
];

type Etapa = "conta" | "empresa" | "perfil" | "pronto";

const etapasLabel: Record<string, string> = {
  conta: "Sua conta",
  empresa: "Empresa",
  perfil: "Perfil",
};

/* ── Componente principal ────────────────────────── */
export default function CadastroPage() {
  const [etapa, setEtapa] = useState<Etapa>("conta");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const router = useRouter();

  // Etapa 1
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Etapa 2 — Empresa
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [cpfSocio, setCpfSocio] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  // Etapa 3 — Perfil financeiro
  const [setor, setSetor] = useState("servicos");
  const [faturamento, setFaturamento] = useState(3000000);
  const [regime, setRegime] = useState("simples_nacional");
  const [numFunc, setNumFunc] = useState("2-5");
  const [temContador, setTemContador] = useState(false);
  const [desafios, setDesafios] = useState<string[]>([]);
  const [comoConheceu, setComoConheceu] = useState("");

  function toggleDesafio(d: string) {
    setDesafios((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  function formatarCNPJ(v: string) {
    const n = v.replace(/\D/g, "").slice(0, 14);
    return n
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  function formatarTel(v: string) {
    const n = v.replace(/\D/g, "").slice(0, 11);
    if (n.length <= 10) return n.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
    return n.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
  }

  async function handleCriarConta(e: React.FormEvent) {
    e.preventDefault();
    setErro(""); setCarregando(true);
    const supabase = createClient();
    const { data: signUpData, error } = await supabase.auth.signUp({ email, password: senha });
    if (error) {
      setErro(error.message.includes("already registered")
        ? "Este email já está cadastrado. Faça login."
        : "Erro ao criar conta. Tente novamente.");
      setCarregando(false); return;
    }
    // Se não veio sessão (confirmação de email ativa), faz login imediato
    if (!signUpData.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (signInError) {
        setErro("Conta criada! Verifique seu email para confirmar antes de continuar.");
        setCarregando(false); return;
      }
    }
    setCarregando(false);
    setEtapa("empresa");
  }

  async function handleSalvarEmpresa(e: React.FormEvent) {
    e.preventDefault();

    // Validação: CNPJ ou CPF do sócio é obrigatório
    const cnpjLimpo = cnpj.replace(/\D/g, "");
    const cpfLimpo = cpfSocio.replace(/\D/g, "");

    if (!cnpjLimpo && !cpfLimpo) {
      setErro("Informe o CNPJ da empresa ou CPF do sócio para continuar.");
      return;
    }

    setErro("");
    setEtapa("perfil");
  }

  async function handleSalvarPerfil(e: React.FormEvent) {
    e.preventDefault();
    setErro(""); setCarregando(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setErro("Sessão expirada. Faça login novamente."); setCarregando(false); return; }

    const { error } = await supabase.from("empresas").insert({
      user_id: user.id,
      nome_fantasia: nomeFantasia,
      cnpj: cnpj.replace(/\D/g, "") || null,
      cpf_socio: cpfSocio.replace(/\D/g, "") || null,
      telefone: telefone.replace(/\D/g, "") || null,
      whatsapp: whatsapp.replace(/\D/g, "") || null,
      site_url: siteUrl || null,
      instagram: instagram || null,
      linkedin: linkedin || null,
      cidade: cidade || null,
      estado: estado || null,
      setor,
      faturamento_anual: faturamento,
      regime_tributario: regime,
      num_funcionarios: numFunc,
      tem_contador: temContador,
      principais_desafios: desafios.length ? desafios : null,
      como_conheceu: comoConheceu || null,
      plano: "starter",
    });

    if (error) { setErro("Erro ao salvar dados. Tente novamente."); setCarregando(false); return; }

    // Enviar email de boas-vindas (fire and forget — não bloqueia o fluxo)
    try {
      fetch("/api/email/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, nomeEmpresa: nomeFantasia }),
      }).catch(() => {}); // silencia erros de rede
    } catch (_) {}

    setCarregando(false);
    setEtapa("pronto");
    setTimeout(() => router.push("/dashboard"), 2500);
  }

  const etapasOrdem: Etapa[] = ["conta", "empresa", "perfil"];
  const etapaIdx = etapasOrdem.indexOf(etapa);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] via-[#1e3060] to-[#0f1d36] flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center font-bold text-white text-base mx-auto mb-3 shadow-xl shadow-blue-900/40">GP</div>
          <h1 className="text-lg font-bold text-white">Meu Gerente PJ</h1>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <Sparkles size={11} className="text-blue-300" />
            <p className="text-xs text-blue-300">Comece grátis — sem cartão</p>
          </div>
        </div>

        {/* Indicador de etapas */}
        {etapa !== "pronto" && (
          <div className="flex items-center justify-center gap-1 mb-5">
            {etapasOrdem.map((e, i) => (
              <div key={e} className="flex items-center gap-1">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  etapa === e ? "bg-white text-[#1B2A4A]" :
                  i < etapaIdx ? "bg-green-400 text-white" :
                  "bg-white/15 text-white/40"
                }`}>
                  {i < etapaIdx ? "✓" : i + 1}
                  <span className="hidden sm:inline">{etapasLabel[e]}</span>
                </div>
                {i < etapasOrdem.length - 1 && (
                  <ChevronRight size={12} className="text-white/25" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 p-6">

          {/* ── Etapa 1: Conta ── */}
          {etapa === "conta" && (
            <>
              <h2 className="text-[15px] font-bold text-gray-900 mb-5">Criar sua conta</h2>
              <form onSubmit={handleCriarConta} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" className="input-base" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Senha</label>
                  <div className="relative">
                    <input type={verSenha ? "text" : "password"} value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" className="input-base pr-10" />
                    <button type="button" onClick={() => setVerSenha(!verSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {verSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{erro}</div>}
                <button type="submit" disabled={carregando || !email || !senha} className="w-full btn-primary py-3 flex items-center justify-center gap-2 rounded-xl text-[14px]">
                  {carregando && <Loader2 size={15} className="animate-spin" />}
                  {carregando ? "Criando conta..." : "Continuar"}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-4">Já tem conta? <Link href="/login" className="text-blue-600 font-semibold hover:underline">Entrar</Link></p>
            </>
          )}

          {/* ── Etapa 2: Empresa ── */}
          {etapa === "empresa" && (
            <>
              <h2 className="text-[15px] font-bold text-gray-900 mb-1">Dados da empresa</h2>
              <p className="text-xs text-gray-400 mb-5">Campos marcados com * são obrigatórios</p>
              <form onSubmit={handleSalvarEmpresa} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Nome da empresa *</label>
                    <input type="text" value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} required placeholder="Nome fantasia ou razão social" className="input-base" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">CNPJ</label>
                    <input type="text" value={cnpj} onChange={(e) => setCnpj(formatarCNPJ(e.target.value))} placeholder="00.000.000/0001-00" className="input-base" inputMode="numeric" maxLength={18} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">CPF do sócio</label>
                    <input type="text" value={cpfSocio} onChange={(e) => setCpfSocio(e.target.value)} placeholder="000.000.000-00" className="input-base" inputMode="numeric" maxLength={14} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Telefone *</label>
                    <input type="tel" value={telefone} onChange={(e) => setTelefone(formatarTel(e.target.value))} required placeholder="(11) 99999-9999" className="input-base" inputMode="numeric" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">WhatsApp</label>
                    <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(formatarTel(e.target.value))} placeholder="(11) 99999-9999" className="input-base" inputMode="numeric" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Cidade</label>
                    <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="São Paulo" className="input-base" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Estado</label>
                    <select value={estado} onChange={(e) => setEstado(e.target.value)} className="input-base">
                      <option value="">Selecione</option>
                      {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3.5">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5">Presença digital <span className="text-gray-400 font-normal normal-case tracking-normal">(opcional)</span></p>
                  <div className="space-y-2.5">
                    <input type="url" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="🌐 Site: https://suaempresa.com.br" className="input-base" />
                    <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="📸 Instagram: @suaempresa" className="input-base" />
                    <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="💼 LinkedIn: linkedin.com/company/..." className="input-base" />
                  </div>
                </div>

                {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{erro}</div>}

                <button type="submit" disabled={!nomeFantasia || !telefone} className="w-full btn-primary py-3 rounded-xl text-[14px]">
                  Continuar
                </button>
              </form>
            </>
          )}

          {/* ── Etapa 3: Perfil financeiro ── */}
          {etapa === "perfil" && (
            <>
              <h2 className="text-[15px] font-bold text-gray-900 mb-1">Perfil financeiro</h2>
              <p className="text-xs text-gray-400 mb-5">Isso personaliza as respostas do consultor para o seu negócio.</p>
              <form onSubmit={handleSalvarPerfil} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Setor</label>
                    <select value={setor} onChange={(e) => setSetor(e.target.value)} className="input-base">
                      {setores.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Funcionários</label>
                    <select value={numFunc} onChange={(e) => setNumFunc(e.target.value)} className="input-base">
                      {numFuncionarios.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Faturamento anual</label>
                    <select value={faturamento} onChange={(e) => setFaturamento(Number(e.target.value))} className="input-base">
                      {faixasFaturamento.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Regime tributário</label>
                    <select value={regime} onChange={(e) => setRegime(e.target.value)} className="input-base">
                      <option value="mei">MEI</option>
                      <option value="simples_nacional">Simples Nacional</option>
                      <option value="lucro_presumido">Lucro Presumido</option>
                      <option value="lucro_real">Lucro Real</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2.5 uppercase tracking-wider">Principais desafios <span className="text-gray-400 font-normal normal-case tracking-normal">(selecione todos que se aplicam)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {opcoesDesafios.map((d) => (
                      <button key={d} type="button" onClick={() => toggleDesafio(d)}
                        className={`text-xs px-3 py-2 rounded-full border transition-all ${
                          desafios.includes(d)
                            ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}>
                        {desafios.includes(d) ? "✓ " : ""}{d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Tem contador / contabilidade?</p>
                    <p className="text-xs text-gray-400">Ajuda a personalizar o tom da IA</p>
                  </div>
                  <button type="button" onClick={() => setTemContador(!temContador)}
                    className={`w-10 h-6 rounded-full transition-all flex-shrink-0 ${temContador ? "bg-blue-500" : "bg-gray-300"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all mx-auto ${temContador ? "translate-x-2" : "-translate-x-1"}`} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Como nos encontrou?</label>
                  <select value={comoConheceu} onChange={(e) => setComoConheceu(e.target.value)} className="input-base">
                    <option value="">Selecione...</option>
                    {opcoesComoConheceu.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{erro}</div>}

                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setEtapa("empresa")}
                    className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-[14px] font-medium hover:bg-gray-50 transition-colors">
                    Voltar
                  </button>
                  <button type="submit" disabled={carregando}
                    className="flex-[2] btn-primary py-3 flex items-center justify-center gap-2 rounded-xl text-[14px]">
                    {carregando && <Loader2 size={15} className="animate-spin" />}
                    {carregando ? "Salvando..." : "Acessar o Gerente PJ"}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ── Etapa 4: Pronto ── */}
          {etapa === "pronto" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={36} className="text-green-500" />
              </div>
              <h2 className="font-bold text-gray-900 text-lg mb-2">Tudo pronto!</h2>
              <p className="text-sm text-gray-500 leading-relaxed">Seu Gerente PJ está configurado e pronto para te ajudar.</p>
              <div className="flex items-center justify-center gap-1.5 mt-4">
                <Loader2 size={12} className="animate-spin text-gray-400" />
                <p className="text-xs text-gray-400">Abrindo o painel...</p>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-blue-400/60 mt-5">
          Gerente com 20+ anos de experiência · CEA & CFP · Dados protegidos pela LGPD
        </p>
      </div>
    </div>
  );
}
