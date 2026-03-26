"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Building2, Globe, Instagram, Linkedin,
  Save, Loader2, CheckCircle2, MapPin, Briefcase,
  Sparkles, CreditCard, AlertTriangle, X, Crown, Zap, Star, CalendarCheck
} from "lucide-react";

/* Opções de selects */
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
  { value: "ate_360k",   label: "Até R$ 360k / ano" },
  { value: "360k_1mm",   label: "R$ 360k a R$ 1MM / ano" },
  { value: "1mm_5mm",    label: "R$ 1MM a R$ 5MM / ano" },
  { value: "5mm_30mm",   label: "R$ 5MM a R$ 30MM / ano" },
  { value: "acima_30mm", label: "Acima de R$ 30MM / ano" },
];

const regimes = [
  { value: "simples",       label: "Simples Nacional" },
  { value: "lucro_presumido", label: "Lucro Presumido" },
  { value: "lucro_real",    label: "Lucro Real" },
  { value: "mei",           label: "MEI" },
];

const numFuncionarios = [
  { value: "1",     label: "Só eu (MEI / sócio)" },
  { value: "2-5",   label: "2 a 5 funcionários" },
  { value: "6-20",  label: "6 a 20 funcionários" },
  { value: "21-50", label: "21 a 50 funcionários" },
  { value: "50+",   label: "Mais de 50 funcionários" },
];

const opcoesDesafios = [
  "Controle de fluxo de caixa",
  "Acesso a crédito com juros baixos",
  "Taxas altas de maquininha/banco",
  "Onde investir o caixa da empresa",
  "Planejamento tributário",
  "Gestão de capital de giro",
];

const UFs = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"
];

/* Masks */
function formatarCNPJ(v: string) {
  return v.replace(/\D/g, "").slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatarTel(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
  return d.replace(/^(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
}

function formatarCPF(v: string) {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/* Section wrapper */
function Section({ icon: Icon, title, subtitle, children }: {
  icon: any; title: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-xl">
          <Icon size={16} className="text-blue-600" />
        </div>
        <div>
          <h2 className="font-bold text-[14px] text-gray-900">{title}</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/* Page */
export default function PerfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [erro, setErro] = useState("");
  const [email, setEmail] = useState("");
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  // Dados da empresa
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [cpfSocio, setCpfSocio] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [instagramVal, setInstagramVal] = useState("");
  const [linkedinVal, setLinkedinVal] = useState("");

  // Perfil financeiro
  const [setor, setSetor] = useState("comercio");
  const [faturamento, setFaturamento] = useState("");
  const [regime, setRegime] = useState("");
  const [numFunc, setNumFunc] = useState("1");
  const [temContador, setTemContador] = useState(false);
  const [desafios, setDesafios] = useState<string[]>([]);

  // Assinatura
  const [plano, setPlano] = useState("starter");
  const [planoCiclo, setPlanoCiclo] = useState<string | null>(null);
  const [planoValidade, setPlanoValidade] = useState<string | null>(null);
  const [asaasSubscriptionId, setAsaasSubscriptionId] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");

      const { data } = await supabase
        .from("empresas")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setEmpresaId(data.id);
        setNomeFantasia(data.nome_fantasia ?? "");
        setCnpj(data.cnpj ?? "");
        setCpfSocio(data.cpf_socio ?? "");
        setTelefone(data.telefone ?? "");
        setWhatsapp(data.whatsapp ?? "");
        setCidade(data.cidade ?? "");
        setEstado(data.estado ?? "");
        setSiteUrl(data.site_url ?? "");
        setInstagramVal(data.instagram ?? "");
        setLinkedinVal(data.linkedin ?? "");
        setSetor(data.setor ?? "comercio");
        setFaturamento(data.faturamento ?? "");
        setRegime(data.regime ?? "");
        setNumFunc(data.num_funcionarios ?? "1");
        setTemContador(data.tem_contador ?? false);
        setDesafios(data.principais_desafios ?? []);
        // Assinatura
        setPlano(data.plano ?? "starter");
        setPlanoCiclo(data.plano_ciclo ?? null);
        setPlanoValidade(data.plano_validade ?? null);
        setAsaasSubscriptionId(data.asaas_subscription_id ?? null);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    if (!empresaId) return;
    setSaving(true);
    setErro("");
    setSaved(false);

    const supabase = createClient();
    const { error } = await supabase
      .from("empresas")
      .update({
        nome_fantasia: nomeFantasia || null,
        cnpj: cnpj || null,
        cpf_socio: cpfSocio || null,
        telefone: telefone || null,
        whatsapp: whatsapp || null,
        cidade: cidade || null,
        estado: estado || null,
        site_url: siteUrl || null,
        instagram: instagramVal || null,
        linkedin: linkedinVal || null,
        setor: setor || null,
        faturamento: faturamento || null,
        regime: regime || null,
        num_funcionarios: numFunc || null,
        tem_contador: temContador,
        principais_desafios: desafios.length ? desafios : null,
      })
      .eq("id", empresaId);

    setSaving(false);
    if (error) {
      setErro("Erro ao salvar. Tente novamente.");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  function toggleDesafio(d: string) {
    setDesafios((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  async function handleCancelarPlano() {
    setCancelando(true);
    try {
      const res = await fetch("/api/cancelar-plano", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setErro(json.error ?? "Erro ao cancelar assinatura.");
      } else {
        setPlano("starter");
        setPlanoCiclo(null);
        setPlanoValidade(null);
        setAsaasSubscriptionId(null);
        setShowCancelModal(false);
      }
    } catch {
      setErro("Erro de conexão ao cancelar. Tente novamente.");
    } finally {
      setCancelando(false);
    }
  }

  // Helpers de exibição do plano
  const PLANO_CONFIG: Record<string, { label: string; cor: string; icon: any }> = {
    starter:      { label: "Starter",      cor: "bg-gray-100 text-gray-600 border-gray-200",          icon: Zap     },
    pro:          { label: "Pro",          cor: "bg-blue-50 text-blue-700 border-blue-200",            icon: Crown   },
    essencial:    { label: "Essencial",    cor: "bg-purple-50 text-purple-700 border-purple-200",      icon: Star    },
    profissional: { label: "Profissional", cor: "bg-amber-50 text-amber-700 border-amber-200",         icon: Crown   },
  };
  const planoInfo = PLANO_CONFIG[plano] ?? PLANO_CONFIG.starter;
  const PlanoIcon = planoInfo.icon;
  const isAtivo = plano !== "starter" && !!asaasSubscriptionId;

  function formatarData(iso: string | null) {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "long", year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-400">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center gap-3 flex-shrink-0">
        <div className="p-2 bg-blue-50 rounded-xl">
          <User size={18} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-[14px] text-gray-900">Meu Perfil</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">Dados da empresa · Perfil financeiro · Contato</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-green-600 text-xs font-medium animate-pulse">
              <CheckCircle2 size={14} />
              Salvo
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#1B2A4A] text-white text-sm rounded-xl hover:bg-[#243660] transition-colors font-medium disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span className="hidden sm:inline">{saving ? "Salvando..." : "Salvar alterações"}</span>
            <span className="sm:hidden">{saving ? "..." : "Salvar"}</span>
          </button>
        </div>
      </div>

      {erro && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
          {erro}
        </div>
      )}

      {/* Modal de cancelamento */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-red-50 rounded-xl">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-[15px] text-gray-900">Cancelar assinatura?</h3>
                <p className="text-[11px] text-gray-400">Essa ação não pode ser desfeita</p>
              </div>
              <button onClick={() => setShowCancelModal(false)} className="ml-auto p-1 hover:bg-gray-100 rounded-lg">
                <X size={16} className="text-gray-400" />
              </button>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-5 space-y-2">
              <p className="text-sm text-red-700">Ao cancelar, você perde imediatamente o acesso a:</p>
              <ul className="text-[12px] text-red-600 space-y-1 ml-1">
                <li>- Módulos exclusivos do plano {planoInfo.label}</li>
                <li>- Simulações e análises ilimitadas</li>
                <li>- Histórico de conversas avançado</li>
              </ul>
              <p className="text-[12px] text-red-600 font-medium">Seu plano voltará para o Starter (gratuito).</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Manter plano
              </button>
              <button
                onClick={handleCancelarPlano}
                disabled={cancelando}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {cancelando ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Cancelando...
                  </span>
                ) : "Confirmar cancelamento"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-5">

        {/* Minha Assinatura */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <CreditCard size={16} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-[14px] text-gray-900">Minha Assinatura</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Gerencie seu plano e pagamentos</p>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${planoInfo.cor}`}>
              <PlanoIcon size={12} />
              {planoInfo.label}
            </div>
          </div>
          <div className="p-6">
            {plano === "starter" ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Zap size={20} className="text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-900 text-[15px]">Plano Starter (Gratuito)</h3>
                <p className="text-[13px] text-gray-500 mt-1 max-w-sm mx-auto">
                  Você está usando o plano gratuito com acesso limitado. Faça upgrade para desbloquear todos os módulos.
                </p>
                <Link
                  href="/upgrade"
                  className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[#1B2A4A] text-white text-sm rounded-xl hover:bg-[#243660] transition-colors font-medium"
                >
                  <Zap size={14} />
                  Ver planos e fazer upgrade
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-3.5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Plano</p>
                    <p className="text-[14px] font-bold text-gray-900">{planoInfo.label}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3.5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Ciclo</p>
                    <p className="text-[14px] font-bold text-gray-900">{planoCiclo === "anual" ? "Anual" : "Mensal"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3.5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Renova em</p>
                    <p className="text-[14px] font-bold text-gray-900 flex items-center gap-1.5">
                      <CalendarCheck size={13} className="text-green-500" />
                      {formatarData(planoValidade) ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
                  <Link
                    href="/upgrade"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1B2A4A] text-white text-sm rounded-xl hover:bg-[#243660] transition-colors font-medium"
                  >
                    <Crown size={14} />
                    Alterar plano
                  </Link>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 text-sm rounded-xl hover:bg-red-50 transition-colors font-medium"
                  >
                    Cancelar assinatura
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conta */}
        <Section icon={User} title="Conta" subtitle="Seu acesso à plataforma">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" value={email} disabled className="input-base bg-gray-50 cursor-not-allowed" />
              <p className="text-[10px] text-gray-400 mt-1">Não é possível alterar o email.</p>
            </div>
          </div>
        </Section>

        {/* Dados da empresa */}
        <Section icon={Building2} title="Dados da Empresa" subtitle="Informações que personalizam o atendimento do consultor">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nome fantasia *</label>
              <input type="text" value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} className="input-base" placeholder="Ex: Padaria do João" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">CNPJ</label>
              <input type="text" value={cnpj} onChange={(e) => setCnpj(formatarCNPJ(e.target.value))} className="input-base" placeholder="00.000.000/0000-00" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">CPF do sócio</label>
              <input type="text" value={cpfSocio} onChange={(e) => setCpfSocio(formatarCPF(e.target.value))} className="input-base" placeholder="000.000.000-00" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Telefone *</label>
              <input type="text" value={telefone} onChange={(e) => setTelefone(formatarTel(e.target.value))} className="input-base" placeholder="(11) 99999-0000" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">WhatsApp</label>
              <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(formatarTel(e.target.value))} className="input-base" placeholder="(11) 99999-0000" />
            </div>
          </div>
        </Section>

        {/* Localização */}
        <Section icon={MapPin} title="Localização" subtitle="Cidade e estado da empresa">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Cidade</label>
              <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} className="input-base" placeholder="São Paulo" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Estado</label>
              <select value={estado} onChange={(e) => setEstado(e.target.value)} className="input-base">
                <option value="">Selecione</option>
                {UFs.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>
        </Section>

        {/* Redes e site */}
        <Section icon={Globe} title="Presença Online" subtitle="Site e redes sociais da empresa">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                <span className="flex items-center gap-1"><Globe size={11} /> Site / URL</span>
              </label>
              <input type="text" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} className="input-base" placeholder="www.suaempresa.com.br" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                <span className="flex items-center gap-1"><Instagram size={11} /> Instagram</span>
              </label>
              <input type="text" value={instagramVal} onChange={(e) => setInstagramVal(e.target.value)} className="input-base" placeholder="@suaempresa" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                <span className="flex items-center gap-1"><Linkedin size={11} /> LinkedIn</span>
              </label>
              <input type="text" value={linkedinVal} onChange={(e) => setLinkedinVal(e.target.value)} className="input-base" placeholder="linkedin.com/company/..." />
            </div>
          </div>
        </Section>

        {/* Perfil financeiro */}
        <Section icon={Briefcase} title="Perfil Financeiro" subtitle="Essas informações melhoram a qualidade das respostas do consultor IA">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Setor</label>
              <select value={setor} onChange={(e) => setSetor(e.target.value)} className="input-base">
                {setores.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Faturamento anual</label>
              <select value={faturamento} onChange={(e) => setFaturamento(e.target.value)} className="input-base">
                <option value="">Selecione</option>
                {faixasFaturamento.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Regime tributário</label>
              <select value={regime} onChange={(e) => setRegime(e.target.value)} className="input-base">
                <option value="">Selecione</option>
                {regimes.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Funcionários</label>
              <select value={numFunc} onChange={(e) => setNumFunc(e.target.value)} className="input-base">
                {numFuncionarios.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
              </select>
            </div>
          </div>

          {/* Contador toggle */}
          <div className="mt-5 flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-700">Tem contador?</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Isso ajuda o consultor a calibrar as respostas tributárias.</p>
            </div>
            <button
              type="button"
              onClick={() => setTemContador(!temContador)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${temContador ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${temContador ? "translate-x-5" : ""}`} />
            </button>
          </div>

          {/* Desafios */}
          <div className="mt-5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Principais desafios</label>
            <div className="flex flex-wrap gap-2">
              {opcoesDesafios.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDesafio(d)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    desafios.includes(d)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Bottom save */}
        <div className="flex justify-end pb-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1B2A4A] text-white text-sm rounded-xl hover:bg-[#243660] transition-colors font-medium disabled:opacity-50 shadow-lg"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}

