"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Users, Building2, TrendingUp, Search, Download,
  ExternalLink, Instagram, Linkedin, Globe,
  ChevronDown, ChevronUp, Sparkles, LogOut,
  CheckCircle2, XCircle, Phone, Mail, ArrowLeft
} from "lucide-react";

const ADMIN_EMAIL = "renankz@gmail.com";

type Empresa = {
  id: string;
  user_id: string;
  nome_fantasia: string;
  cnpj: string | null;
  cpf_socio: string | null;
  telefone: string | null;
  whatsapp: string | null;
  site_url: string | null;
  instagram: string | null;
  linkedin: string | null;
  cidade: string | null;
  estado: string | null;
  setor: string | null;
  faturamento: string | null;
  regime: string | null;
  num_funcionarios: string | null;
  tem_contador: boolean | null;
  principais_desafios: string[] | null;
  como_conheceu: string | null;
  plano: string | null;
  perfil_completo: boolean | null;
  created_at: string;
  user_email?: string;
};

const FATURAMENTO_LABELS: Record<string, string> = {
  "ate_360k": "Até R$ 360k/ano",
  "360k_1mm": "R$ 360k – 1MM",
  "1mm_5mm": "R$ 1MM – 5MM",
  "5mm_30mm": "R$ 5MM – 30MM",
  "acima_30mm": "Acima de R$ 30MM",
};

const SETOR_LABELS: Record<string, string> = {
  comercio: "Comércio",
  servicos: "Serviços",
  industria: "Indústria",
  agronegocio: "Agronegócio",
  saude: "Saúde",
  tecnologia: "Tecnologia",
  construcao: "Construção",
  educacao: "Educação",
  outro: "Outro",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric"
  });
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
      <div className={`p-2.5 sm:p-3 rounded-xl ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/* ── Mobile Card for each empresa ──────────────── */
function EmpresaCard({ e, expanded, onToggle }: { e: Empresa; expanded: boolean; onToggle: () => void }) {
  const iniciais = (e.nome_fantasia || "?").split(" ").slice(0, 2).map(p => p[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1B2A4A] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {iniciais}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{e.nome_fantasia || "—"}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                  e.plano === "pro" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"
                }`}>{e.plano || "starter"}</span>
                {e.perfil_completo ? (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-100 text-emerald-700">✓ Completo</span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-100 text-amber-700">⚠ Incompleto</span>
                )}
                <span className="text-[11px] text-gray-400">{formatDate(e.created_at)}</span>
              </div>
            </div>
          </div>
          <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-[12px]">
          {e.cnpj && <div><span className="text-gray-400">CNPJ</span><p className="text-gray-700 font-mono">{e.cnpj}</p></div>}
          {(e.cidade || e.estado) && <div><span className="text-gray-400">Local</span><p className="text-gray-700">{[e.cidade, e.estado].filter(Boolean).join(", ")}</p></div>}
          {e.telefone && <div><span className="text-gray-400">Tel</span><p className="text-gray-700">{e.telefone}</p></div>}
          {e.setor && <div><span className="text-gray-400">Setor</span><p className="text-gray-700">{SETOR_LABELS[e.setor] || e.setor}</p></div>}
          {e.faturamento && <div><span className="text-gray-400">Faturamento</span><p className="text-gray-700">{FATURAMENTO_LABELS[e.faturamento] || e.faturamento}</p></div>}
        </div>

        <div className="flex items-center gap-2 mt-3">
          {e.instagram && (
            <a href={`https://instagram.com/${e.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="text-pink-500"><Instagram size={16} /></a>
          )}
          {e.linkedin && (
            <a href={e.linkedin.startsWith("http") ? e.linkedin : `https://linkedin.com/in/${e.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-600"><Linkedin size={16} /></a>
          )}
          {e.site_url && (
            <a href={e.site_url.startsWith("http") ? e.site_url : `https://${e.site_url}`} target="_blank" rel="noopener noreferrer" className="text-gray-500"><Globe size={16} /></a>
          )}
        </div>
      </div>

      {expanded && (
        <div className="bg-blue-50/30 px-4 py-3 border-t border-gray-100 grid grid-cols-2 gap-3 text-[12px]">
          <div><p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Regime</p><p className="text-gray-700">{e.regime || "—"}</p></div>
          <div><p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Funcionários</p><p className="text-gray-700">{e.num_funcionarios || "—"}</p></div>
          <div><p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Contador</p><div className="flex items-center gap-1">{e.tem_contador ? <><CheckCircle2 size={12} className="text-green-500" /><span className="text-gray-700">Sim</span></> : <><XCircle size={12} className="text-red-400" /><span className="text-gray-700">Não</span></>}</div></div>
          <div><p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Como conheceu</p><p className="text-gray-700">{e.como_conheceu || "—"}</p></div>
          {(e.principais_desafios || []).length > 0 && (
            <div className="col-span-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Desafios</p>
              <div className="flex flex-wrap gap-1">{e.principais_desafios!.map(d => <span key={d} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[11px]">{d}</span>)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroSetor, setFiltroSetor] = useState("");
  const [filtroFaturamento, setFiltroFaturamento] = useState("");
  const [filtroComo, setFiltroComo] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        router.replace("/dashboard");
        return;
      }
      setAuthorized(true);

      // Fetch all empresas
      const { data } = await supabase
        .from("empresas")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setEmpresas(data as Empresa[]);
      }
      setLoading(false);
    }
    init();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const setores = [...new Set(empresas.map(e => e.setor).filter(Boolean))];
  const faturamentos = [...new Set(empresas.map(e => e.faturamento).filter(Boolean))];
  const comoConheceu = [...new Set(empresas.map(e => e.como_conheceu).filter(Boolean))];

  const filtradas = empresas.filter(e => {
    const termo = busca.toLowerCase();
    const matchBusca = !busca
      || (e.nome_fantasia || "").toLowerCase().includes(termo)
      || (e.cnpj || "").includes(termo)
      || (e.cidade || "").toLowerCase().includes(termo)
      || (e.estado || "").toLowerCase().includes(termo);
    const matchSetor = !filtroSetor || e.setor === filtroSetor;
    const matchFat = !filtroFaturamento || e.faturamento === filtroFaturamento;
    const matchComo = !filtroComo || e.como_conheceu === filtroComo;
    return matchBusca && matchSetor && matchFat && matchComo;
  });

  // Stats
  const totalEmpresas = empresas.length;
  const comCNPJ = empresas.filter(e => e.cnpj).length;
  const comContato = empresas.filter(e => e.telefone || e.whatsapp).length;
  const comRedes = empresas.filter(e => e.instagram || e.linkedin).length;
  const comPerfilCompleto = empresas.filter(e => e.perfil_completo).length;

  function exportCSV() {
    const headers = ["Nome", "CNPJ", "CPF do sócio", "Telefone", "WhatsApp", "Cidade", "Estado", "Setor", "Faturamento", "Funcionários", "Instagram", "LinkedIn", "Site", "Como conheceu", "Desafios", "Perfil", "Plano", "Cadastro"];
    const rows = filtradas.map(e => [
      e.nome_fantasia || "",
      e.cnpj || "",
      e.cpf_socio || "",
      e.telefone || "",
      e.whatsapp || "",
      e.cidade || "",
      e.estado || "",
      SETOR_LABELS[e.setor || ""] || e.setor || "",
      FATURAMENTO_LABELS[e.faturamento || ""] || e.faturamento || "",
      e.num_funcionarios || "",
      e.instagram || "",
      e.linkedin || "",
      e.site_url || "",
      e.como_conheceu || "",
      (e.principais_desafios || []).join("; "),
      e.perfil_completo ? "Completo" : "Incompleto",
      e.plano || "starter",
      formatDate(e.created_at),
    ].map(v => `"${v}"`));

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-meu-gerente-pj-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-[#1B2A4A] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center font-black text-[11px] shadow">
            GP
          </div>
          <div>
            <p className="font-bold text-sm">Painel Admin</p>
            <div className="flex items-center gap-1">
              <Sparkles size={9} className="text-blue-300" />
              <p className="text-[10px] text-blue-300">Meu Gerente PJ</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 text-blue-200/70 hover:text-white text-xs transition-colors"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <span className="text-blue-800/40 hidden sm:block">|</span>
          <span className="text-[11px] text-blue-300 hidden sm:block">renankz@gmail.com</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-blue-200/70 hover:text-white text-xs transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Leads & Empresas Cadastradas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Todos os usuários que se cadastraram na plataforma — {totalEmpresas} no total.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <StatCard icon={Users} label="Total cadastrado" value={totalEmpresas} color="bg-[#1B2A4A]" />
          <StatCard icon={Building2} label="Com CNPJ informado" value={comCNPJ} color="bg-blue-500" />
          <StatCard icon={Phone} label="Com telefone/WhatsApp" value={comContato} color="bg-green-500" />
          <StatCard icon={TrendingUp} label="Com redes sociais" value={comRedes} color="bg-purple-500" />
          <StatCard icon={CheckCircle2} label="Perfil completo" value={comPerfilCompleto} color="bg-emerald-500" />
        </div>

        {/* Filters + Export */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, CNPJ, cidade..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Setor */}
            <select
              value={filtroSetor}
              onChange={e => setFiltroSetor(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white text-gray-600"
            >
              <option value="">Todos os setores</option>
              {setores.map(s => (
                <option key={s!} value={s!}>{SETOR_LABELS[s!] || s}</option>
              ))}
            </select>

            {/* Faturamento */}
            <select
              value={filtroFaturamento}
              onChange={e => setFiltroFaturamento(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white text-gray-600"
            >
              <option value="">Todos os faturamentos</option>
              {faturamentos.map(f => (
                <option key={f!} value={f!}>{FATURAMENTO_LABELS[f!] || f}</option>
              ))}
            </select>

            {/* Como conheceu */}
            <select
              value={filtroComo}
              onChange={e => setFiltroComo(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white text-gray-600"
            >
              <option value="">Como conheceu</option>
              {comoConheceu.map(c => (
                <option key={c!} value={c!}>{c}</option>
              ))}
            </select>

            {/* Export */}
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#1B2A4A] text-white text-sm rounded-xl hover:bg-[#243660] transition-colors font-medium flex-shrink-0"
            >
              <Download size={14} />
              Exportar CSV
            </button>
          </div>

          {(busca || filtroSetor || filtroFaturamento || filtroComo) && (
            <p className="text-xs text-gray-400 mt-2">
              {filtradas.length} resultado{filtradas.length !== 1 ? "s" : ""} encontrado{filtradas.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Mobile Cards (< md) */}
        <div className="md:hidden space-y-3">
          {filtradas.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-gray-100">
              <Users size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Nenhuma empresa encontrada</p>
            </div>
          ) : filtradas.map((e) => (
            <EmpresaCard key={e.id} e={e} expanded={expandedRow === e.id} onToggle={() => setExpandedRow(expandedRow === e.id ? null : e.id)} />
          ))}
        </div>

        {/* Desktop Table (>= md) */}
        <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filtradas.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Nenhuma empresa encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80">
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Empresa</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">CNPJ</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Contato</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Localidade</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Setor</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Faturamento</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Redes</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Cadastro</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Perfil</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtradas.map((e) => {
                    const expanded = expandedRow === e.id;
                    return (
                      <>
                        <tr key={e.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-[#1B2A4A] flex items-center justify-center text-white font-bold text-[11px] flex-shrink-0">
                                {(e.nome_fantasia || "?").split(" ").slice(0, 2).map(p => p[0]).join("").toUpperCase().slice(0, 2)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-[13px]">{e.nome_fantasia || "—"}</p>
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                  e.plano === "pro" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"
                                }`}>{e.plano || "starter"}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3"><p className="text-gray-700 text-[12px] font-mono">{e.cnpj || <span className="text-gray-300">—</span>}</p></td>
                          <td className="px-4 py-3">
                            <div className="space-y-0.5">
                              {e.telefone && <div className="flex items-center gap-1 text-[12px] text-gray-600"><Phone size={10} className="text-gray-400" />{e.telefone}</div>}
                              {e.whatsapp && e.whatsapp !== e.telefone && <div className="flex items-center gap-1 text-[12px] text-gray-600"><span className="text-[9px] text-green-600 font-bold">WA</span>{e.whatsapp}</div>}
                              {!e.telefone && !e.whatsapp && <span className="text-gray-300 text-[12px]">—</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3"><p className="text-gray-600 text-[12px]">{[e.cidade, e.estado].filter(Boolean).join(", ") || <span className="text-gray-300">—</span>}</p></td>
                          <td className="px-4 py-3"><p className="text-gray-600 text-[12px]">{SETOR_LABELS[e.setor || ""] || e.setor || <span className="text-gray-300">—</span>}</p></td>
                          <td className="px-4 py-3"><p className="text-gray-600 text-[12px] whitespace-nowrap">{FATURAMENTO_LABELS[e.faturamento || ""] || e.faturamento || <span className="text-gray-300">—</span>}</p></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {e.instagram ? <a href={`https://instagram.com/${e.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-600"><Instagram size={14} /></a> : <Instagram size={14} className="text-gray-200" />}
                              {e.linkedin ? <a href={e.linkedin.startsWith("http") ? e.linkedin : `https://linkedin.com/in/${e.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700"><Linkedin size={14} /></a> : <Linkedin size={14} className="text-gray-200" />}
                              {e.site_url ? <a href={e.site_url.startsWith("http") ? e.site_url : `https://${e.site_url}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700"><Globe size={14} /></a> : <Globe size={14} className="text-gray-200" />}
                            </div>
                          </td>
                          <td className="px-4 py-3"><p className="text-gray-500 text-[12px] whitespace-nowrap">{formatDate(e.created_at)}</p></td>
                          <td className="px-4 py-3">
                            {e.perfil_completo ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold">
                                <CheckCircle2 size={12} />
                                Completo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[11px] font-semibold">
                                <span className="text-sm">⚠</span>
                                Incompleto
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => setExpandedRow(expanded ? null : e.id)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </td>
                        </tr>
                        {expanded && (
                          <tr key={`${e.id}-detail`} className="bg-blue-50/30">
                            <td colSpan={10} className="px-6 py-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[12px]">
                                <div><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Regime tributário</p><p className="text-gray-700">{e.regime || "—"}</p></div>
                                <div><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Funcionários</p><p className="text-gray-700">{e.num_funcionarios || "—"}</p></div>
                                <div><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Tem contador</p><div className="flex items-center gap-1">{e.tem_contador ? <><CheckCircle2 size={13} className="text-green-500" /><span className="text-gray-700">Sim</span></> : <><XCircle size={13} className="text-red-400" /><span className="text-gray-700">Não</span></>}</div></div>
                                <div><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">CPF do sócio</p><p className="text-gray-700 font-mono">{e.cpf_socio || "—"}</p></div>
                                <div><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Como conheceu</p><p className="text-gray-700">{e.como_conheceu || "—"}</p></div>
                                <div className="md:col-span-3"><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Principais desafios</p><div className="flex flex-wrap gap-1.5">{(e.principais_desafios || []).length > 0 ? e.principais_desafios!.map(d => <span key={d} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[11px] font-medium">{d}</span>) : <span className="text-gray-400">—</span>}</div></div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6 mb-2">
          Painel admin · Meu Gerente PJ · Acesso restrito
        </p>
      </div>
    </div>
  );
    }
