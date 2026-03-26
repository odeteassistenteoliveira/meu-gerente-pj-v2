"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle2, Sparkles, Eye, EyeOff, ChevronRight } from "lucide-react";

/* Ã¢ÂÂÃ¢ÂÂ Dados de formulÃÂ¡rio Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
const setores = [
  { value: "comercio",    label: "ComÃÂ©rcio / Varejo" },
  { value: "servicos",    label: "PrestaÃÂ§ÃÂ£o de ServiÃÂ§os" },
  { value: "industria",   label: "IndÃÂºstria / Manufatura" },
  { value: "agronegocio", label: "AgronegÃÂ³cio" },
  { value: "tecnologia",  label: "Tecnologia / SaaS" },
  { value: "saude",       label: "SaÃÂºde / FarmÃÂ¡cia" },
  { value: "construcao",  label: "ConstruÃÂ§ÃÂ£o Civil" },
  { value: "educacao",    label: "EducaÃÂ§ÃÂ£o" },
  { value: "outro",       label: "Outro" },
];

const faixasFaturamento = [
  { value: 1000000,  label: "AtÃÂ© R$1MM / ano" },
  { value: 3000000,  label: "R$1MM a R$3MM / ano" },
  { value: 10000000, label: "R$3MM a R$10MM / ano" },
  { value: 30000000, label: "R$10MM a R$30MM / ano" },
];

const opcoesDesafios = [
  "Controle de fluxo de caixa",
  "Acesso a crÃÂ©dito com juros baixos",
  "Taxas altas de maquininha/banco",
  "Onde investir o caixa da empresa",
  "Planejamento tributÃÂ¡rio",
  "GestÃÂ£o de capital de giro",
];

const opcoesComoConheceu = [
  "Google / pesquisa",
  "Instagram / Facebook",
  "LinkedIn",
  "IndicaÃÂ§ÃÂ£o de amigo",
  "Contador / consultor",
  "Outro",
];

const numFuncionarios = [
  { value: "1",     label: "SÃÂ³ eu (MEI / sÃÂ³cio)" },
  { value: "2-5",   label: "2 a 5 funcionÃÂ¡rios" },
  { value: "6-20",  label: "6 a 20 funcionÃÂ¡rios" },
  { value: "21-50", label: "21 a 50 funcionÃÂ¡rios" },
  { value: "50+",   label: "Mais de 50 funcionÃÂ¡rios" },
];

type Etapa = "conta" | "empresa" | "perfil" | "pronto";

const etapasLabel: Record<string, string> = {
  conta: "Sua conta",
  empresa: "Empresa",
  perfil: "Perfil",
};

/* Ã¢ÂÂÃ¢ÂÂ Componente principal Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
export default function CadastroPage() {
  const [etapa, setEtapa] = useState<Etapa>("conta");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(""); const [userId, setUserId] = useState<string | null>(null);
  const [verSenha, setVerSenha] = useState(false);
  const router = useRouter();

  // Etapa 1
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Etapa 2 Ã¢ÂÂ Empresa
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

  // Etapa 3 Ã¢ÂÂ Perfil financeiro
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
        ? "Este email jÃÂ¡ estÃÂ¡ cadastrado. FaÃÂ§a login."
        : "Erro ao criar conta. Tente novamente.");
      setCarregando(false); return;
    }
    // Se nÃÂ£o veio sessÃÂ£o (confirmaÃÂ§ÃÂ£o de email ativa), faz login imediato
    if (!signUpData.session) { const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password: senha }); if (signInError) { setErro("Conta criada! Verifique seu email para confirmar antes de continuar."); setCarregando(false); return; } setUserId(signInData.user?.id ?? signUpData.user?.id ?? null); } else { setUserId(signUpData.user?.id ?? null); } setCarregando(false); setEtapa("empresa");
  }

  async function handleSalvarEmpresa(e: React.FormEvent) {
    e.preventDefault();
    setEtapa("perfil");
  }

  async function handleSalvarPerfil(e: React.FormEvent) {
    e.preventDefault();
    setErro(""); setCarregando(true);
    const supabase = createClient();
    if (!userId) { setCarregando(false); return; }

    const { error } = await supabase.from("empresas").insert({
      user_id: userId,
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

    // Enviar email de boas-vindas (fire and forget Ã¢ÂÂ nÃÂ£o bloqueia o fluxo)
    try {
      fetch("/api/email/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, nomeEmpresa: nomeFantasia }),
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
            <p className="text-xs text-blue-300">Comece grÃÂ¡tis Ã¢ÂÂ sem cartÃÂ£o</p>
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
                  {i < etapaIdx ? "Ã¢ÂÂ" : i + 1}
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

          {/* Ã¢ÂÂÃ¢ÂÂ Etapa 1: Conta Ã¢ÂÂÃ¢ÂÂ */}
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
                    <input type={verSenha ? "text" : "password"} value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} placeholder="MÃÂ­nimo 6 caracteres" className="input-base pr-10" />
                    <button type="button" onClick={() => setVerSenha(!verSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {verSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{erro}</div>}
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 mb-3">
              <span className="mt-0.5 text-sm">📧</span>
              <span>Após criar sua conta, você receberá um <strong>e-mail de confirmação</strong>. É necessário confirmar o e-mail para conseguir fazer login na plataforma.</span>
            </div>
            <button type="submit" disabled={carregando || !email || !senha} className="w-full btn-primary py-3 flex items-center justify-center gap-2 rounded-xl text-[14px]">
                  {carregando && <Loader2 size={15} className="animate-spin" />}
                  {carregando ? "Criando conta..." : "Continuar"}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-4">JÃÂ¡ tem conta? <Link href="/login" className="text-blue-600 font-semibold hover:underline">Entrar</Link></p>
            </>
          )}

          {/* Ã¢ÂÂÃ¢ÂÂ Etapa 2: Empresa Ã¢ÂÂÃ¢ÂÂ */}
          {etapa === "empresa" && (
            <>
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 mb-4">
              <span className="mt-0.5 text-sm">📬</span>
              <span><strong>Verifique seu e-mail!</strong> Enviamos um link de confirmação para <strong>{email}</strong>. Confirme antes de tentar fazer login.</span>
            </div>
            <h2 className="text-[15px] font-bold text-gray-900 mb-1">Dados da empresa</h2>
              <p className="text-xs text-gray-400 mb-5">Campos marcados com * sÃÂ£o obrigatÃÂ³rios</p>
              <form onSubmit={handleSalvarEmpresa} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Nome da empresa *</label>
                    <input type="text" value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} required placeholder="Nome fantasia ou razÃÂ£o social" className="input-base" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">CNPJ</label>
                    <input type="text" value={cnpj} onChange={(e) => setCnpj(formatarCNPJ(e.target.value))} placeholder="00.000.000/0001-00" className="input-base" inputMode="numeric" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">CPF do sÃÂ³cio</label>
                    <input type="text" value={cpfSocio} onChange={(e) => setCpfSocio(e.target.value)} placeholder="000.000.000-00" className="input-base" inputMode="numeric" />
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
                    <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="SÃÂ£o Paulo" className="input-base" />
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
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5">PresenÃÂ§a digital <span className="text-gray-400 font-normal normal-case tracking-normal">(opcional)</span></p>
                  <div className="space-y-2.5">
                    <input type="url" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="Ã°ÂÂÂ Site: https://suaempresa.com.br" className="input-base" />
                    <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Ã°ÂÂÂ¸ Instagram: @suaempresa" className="input-base" />
                    <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="Ã°ÂÂÂ¼ LinkedIn: linkedin.com/company/..." className="input-base" />
                  </div>
                </div>

                <button type="submit" disabled={!nomeFantasia || !telefone} className="w-full btn-primary py-3 rounded-xl text-[14px]">
                  Continuar
                </button>
              </form>
            </>
          )}

          {/* Ã¢ÂÂÃ¢ÂÂ Etapa 3: Perfil financeiro Ã¢ÂÂÃ¢ÂÂ */}
          {etapa === "perfil" && (
            <>
              <h2 className="text-[15px] font-bold text-gray-900 mb-1">Perfil financeiro</h2>
              <p className="text-xs text-gray-400 mb-5">Isso personaliza as respostas do consultor para o seu negÃÂ³cio.</p>
              <form onSubmit={handleSalvarPerfil} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Setor</label>
                    <select value={setor} onChange={(e) => setSetor(e.target.value)} className="input-base">
                      {setores.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">FuncionÃÂ¡rios</label>
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
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Regime tributÃÂ¡rio</label>
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
                        {desafios.includes(d) ? "Ã¢ÂÂ " : ""}{d}
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

          {/* Ã¢ÂÂÃ¢ÂÂ Etapa 4: Pronto Ã¢ÂÂÃ¢ÂÂ */}
          {etapa === "pronto" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={36} className="text-green-500" />
              </div>
              <h2 className="font-bold text-gray-900 text-lg mb-2">Tudo pronto!</h2>
              <p className="text-sm text-gray-500 leading-relaxed">Seu Gerente PJ estÃÂ¡ configurado e pronto para te ajudar.</p>
              <div className="flex items-center justify-center gap-1.5 mt-4">
                <Loader2 size={12} className="animate-spin text-gray-400" />
                <p className="text-xs text-gray-400">Abrindo o painel...</p>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-blue-400/60 mt-5">
          Gerente com 20+ anos de experiÃÂªncia ÃÂ· CEA & CFP ÃÂ· Dados protegidos pela LGPD
        </p>
      </div>
    </div>
  );
}
