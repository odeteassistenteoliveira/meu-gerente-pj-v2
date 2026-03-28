"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users, TrendingUp, Search, Download, ExternalLink,
  Instagram, Linkedin, Globe, ChevronDown, ChevronUp,
  Sparkles, LogOut, CheckCircle2, XCircle, Phone,
  ArrowLeft, RefreshCw, MessageSquare, Zap, BarChart3,
  Calendar, Edit3, Save, X, Eye, RotateCcw, Mail,
  Trash2, AlertTriangle, TrendingDown
} from "lucide-react";

const ADMIN_EMAIL = "renankz@gmail.com";
const PLANOS = ["starter", "essencial", "profissional", "pro"];
const PLANOS_PAGOS = ["essencial", "profissional", "pro"];
const PLANO_LABELS: Record<string, string> = {
  starter: "Starter", essencial: "Essencial", profissional: "Profissional", pro: "Pro"
};
const PLANO_PRICES: Record<string, number> = {
  starter: 0, essencial: 97, profissional: 197, pro: 297
};
const PLANO_COLORS: Record<string, string> = {
  starter: "bg-gray-100 text-gray-600",
  essencial: "bg-blue-100 text-blue-700",
  profissional: "bg-purple-100 text-purple-700",
  pro: "bg-amber-100 text-amber-700",
};
const STATUS_LEAD = [
  { value: "novo",       label: "Novo",       color: "bg-blue-100 text-blue-700",    dot: "bg-blue-500" },
  { value: "contatado",  label: "Contatado",  color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-400" },
  { value: "negociando", label: "Negociando", color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  { value: "convertido", label: "Convertido", color: "bg-green-100 text-green-700",   dot: "bg-green-500" },
  { value: "perdido",    label: "Perdido",    color: "bg-red-100 text-red-500",       dot: "bg-red-400" },
];
const FATURAMENTO_LABELS: Record<string, string> = {
  ate_360k: "Até R$ 360k", "360k_1mm": "R$ 360k–1MM",
  "1mm_5mm": "R$ 1MM–5MM", "5mm_30mm": "R$ 5MM–30MM", acima_30mm: "Acima de R$ 30MM",
};
const SETOR_LABELS: Record<string, string> = {
  comercio: "Comércio", servicos: "Serviços", industria: "Indústria",
  agronegocio: "Agronegócio", saude: "Saúde", tecnologia: "Tecnologia",
  construcao: "Construção", educacao: "Educação", outro: "Outro",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

type Empresa = {
  id: string; user_id: string; nome_fantasia: string; cnpj: string | null;
  telefone: string | null; whatsapp: string | null; cidade: string | null;
  estado: string | null; setor: string | null; faturamento: string | null;
  regime: string | null; num_funcionarios: string | null; tem_contador: boolean | null;
  principais_desafios: string[] | null; como_conheceu: string | null;
  plano: string | null; perfil_completo: boolean | null; created_at: string;
  total_mensagens: number; lead_status: string | null;
  observacoes: string | null; proximo_contato: string | null;
  churned_at: string | null; plano_anterior: string | null;
  user_email: string; instagram: string | null; linkedin: string | null;
  site_url: string | null; cpf_socio: string | null;
};
type Stats = { visitantes: number; novosHoje: number; novosSemana: number; novosMes: number; };

/* ── Funnel Bar ── */
function FunnelBar({ label, value, total, color, icon: Icon }: {
  label: string; value: number; total: number; color: string; icon: React.ElementType;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex-1 min-w-0">
      <div className={`rounded-2xl p-4 ${color} text-white relative overflow-hidden`}>
        <div className="flex items-center justify-between mb-2">
          <Icon size={16} className="opacity-80" />
          <span className="text-xs font-bold opacity-80">{pct}%</span>
        </div>
        <p className="text-2xl font-black">{value.toLocaleString("pt-BR")}</p>
        <p className="text-xs opacity-75 mt-0.5 truncate">{label}</p>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
          <div className="h-full bg-white/30" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

/* ── KPI Card ── */
function KpiCard({ label, value, sub, color, warn }: {
  label: string; value: string | number; sub?: string; color: string; warn?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-4 ${warn ? "border-red-200 bg-red-50/30" : "border-gray-100"}`}>
      <p className={`text-2xl font-black ${warn ? "text-red-600" : "text-gray-900"}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      {sub && <p className={`text-[11px] font-semibold mt-1 ${color}`}>{sub}</p>}
    </div>
  );
}

/* ── Modal de confirmação de exclusão ── */
function DeleteModal({ empresa, onClose, onConfirm }: {
  empresa: Empresa; onClose: () => void; onConfirm: () => Promise<void>;
}) {
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const nomeConfirm = (empresa.nome_fantasia || "DELETAR").toUpperCase().slice(0, 20);

  async function handleDelete() {
    if (confirmText.toUpperCase() !== nomeConfirm) return;
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-red-600 text-white px-5 py-4 flex items-center gap-3">
          <AlertTriangle size={18} />
          <div>
            <p className="font-bold text-sm">Excluir usuário permanentemente</p>
            <p className="text-xs text-red-200">Esta ação não pode ser desfeita</p>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
            <p className="font-semibold mb-1">{empresa.nome_fantasia || "—"}</p>
            <p className="text-xs text-red-500">{empresa.user_email}</p>
            <p className="text-xs mt-2">Serão removidos: conta de acesso, dados da empresa e histórico completo.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Digite <span className="font-mono bg-gray-100 px-1 rounded">{nomeConfirm}</span> para confirmar:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value.toUpperCase())}
              placeholder={nomeConfirm}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 font-mono uppercase"
            />
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={confirmText !== nomeConfirm || deleting}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {deleting ? <><RefreshCw size={14} className="animate-spin" />Excluindo...</> : <><Trash2 size={14} />Excluir definitivamente</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal de edição do lead ── */
function LeadModal({ empresa, onClose, onSave, onDelete }: {
  empresa: Empresa; onClose: () => void;
  onSave: (id: string, data: Partial<Empresa>) => Promise<void>;
  onDelete: (empresa: Empresa) => void;
}) {
  const [plano, setPlano] = useState(empresa.plano ?? "starter");
  const [status, setStatus] = useState(empresa.lead_status ?? "novo");
  const [obs, setObs] = useState(empresa.observacoes ?? "");
  const [followUp, setFollowUp] = useState(empresa.proximo_contato ?? "");
  const [resetMsg, setResetMsg] = useState(false);
  const [saving, setSaving] = useState(false);

  const planoAtualPago = PLANOS_PAGOS.includes(empresa.plano ?? "");
  const mudandoParaStarter = plano === "starter" && planoAtualPago;

  async function handleSave() {
    setSaving(true);
    await onSave(empresa.id, { plano, lead_status: status, observacoes: obs, proximo_contato: followUp || null, ...(resetMsg ? { total_mensagens: 0 } as unknown as Partial<Empresa> : {}) });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-[#1B2A4A] text-white px-5 py-4 flex items-center justify-between sticky top-0">
          <div>
            <p className="font-bold text-sm">{empresa.nome_fantasia || "—"}</p>
            <p className="text-xs text-blue-300">{empresa.user_email}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onDelete(empresa)} title="Excluir usuário"
              className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-red-200 transition-colors">
              <Trash2 size={14} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10"><X size={16} /></button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Plano */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Plano</label>
            {mudandoParaStarter && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-2 text-xs text-red-600">
                <TrendingDown size={12} /><span>Isso registrará um <strong>churn</strong> e marcará o lead como Perdido.</span>
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              {PLANOS.map(p => (
                <button key={p} onClick={() => setPlano(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    plano === p ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}>{PLANO_LABELS[p]}</button>
              ))}
            </div>
          </div>

          {/* Status CRM */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Status do Lead</label>
            <div className="flex gap-2 flex-wrap">
              {STATUS_LEAD.map(s => (
                <button key={s.value} onClick={() => setStatus(s.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    status === s.value ? `border-current ${s.color}` : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Próximo contato */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Próximo Follow-up</label>
            <input type="date" value={followUp} onChange={e => setFollowUp(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400" />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Observações</label>
            <textarea value={obs} onChange={e => setObs(e.target.value)} rows={3}
              placeholder="Notas sobre este lead..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 resize-none" />
          </div>

          {(empresa.plano ?? "starter") === "starter" && (
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={resetMsg} onChange={e => setResetMsg(e.target.checked)} className="w-4 h-4 rounded accent-blue-600" />
              <span className="text-sm text-gray-600">Resetar contagem de mensagens (dar cortesia)</span>
            </label>
          )}

          {empresa.churned_at && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-600 flex items-center gap-2">
              <TrendingDown size={12} />
              <span>Churn em {formatDate(empresa.churned_at)} · Plano anterior: <strong>{PLANO_LABELS[empresa.plano_anterior ?? ""] || empresa.plano_anterior}</strong></span>
            </div>
          )}
        </div>

        <div className="px-5 pb-5 flex gap-3 sticky bottom-0 bg-white pt-2 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-[#1B2A4A] text-white text-sm font-bold hover:bg-[#243660] disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <><RefreshCw size={14} className="animate-spin" />Salvando...</> : <><Save size={14} />Salvar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══ PÁGINA PRINCIPAL ══ */
export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [stats, setStats] = useState<Stats>({ visitantes: 0, novosHoje: 0, novosSemana: 0, novosMes: 0 });
  const [busca, setBusca] = useState("");
  const [filtroPlano, setFiltroPlano] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<Empresa | null>(null);
  const [deleteModal, setDeleteModal] = useState<Empresa | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/empresas");
      if (res.status === 401) { router.replace("/dashboard"); return; }
      const json = await res.json();
      setEmpresas(json.empresas ?? []);
      setStats(json.stats ?? { visitantes: 0, novosHoje: 0, novosSemana: 0, novosMes: 0 });
      setAuthorized(true);
      setLastUpdated(new Date());
    } finally { setLoading(false); setRefreshing(false); }
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleSaveLead(empresaId: string, data: Partial<Empresa>) {
    await fetch("/api/admin/update-empresa", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empresa_id: empresaId, ...data, reset_mensagens: (data as Record<string, unknown>).total_mensagens === 0 }),
    });
    setEmpresas(prev => prev.map(e => e.id === empresaId ? { ...e, ...data } : e));
  }

  async function handleDeleteUser() {
    if (!deleteModal) return;
    await fetch("/api/admin/delete-usuario", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: deleteModal.user_id, empresa_id: deleteModal.id }),
    });
    setEmpresas(prev => prev.filter(e => e.id !== deleteModal.id));
    setDeleteModal(null);
    setEditModal(null);
  }

  // ── Métricas ──
  const total = empresas.length;
  const leadsQuentes = empresas.filter(e => (e.total_mensagens ?? 0) >= 10 && (e.plano ?? "starter") === "starter").length;
  const pagos = empresas.filter(e => PLANOS_PAGOS.includes(e.plano ?? "")).length;
  const churned = empresas.filter(e => e.churned_at).length;
  const mrr = empresas.reduce((acc, e) => acc + (PLANO_PRICES[e.plano ?? "starter"] ?? 0), 0);
  const mrrPerdido = empresas.filter(e => e.churned_at && e.plano_anterior)
    .reduce((acc, e) => acc + (PLANO_PRICES[e.plano_anterior ?? ""] ?? 0), 0);
  const taxaConv = total > 0 ? ((pagos / total) * 100).toFixed(1) : "0";
  const churnRate = (pagos + churned) > 0 ? ((churned / (pagos + churned)) * 100).toFixed(1) : "0";

  // Churns este mês
  const mesAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const churnMes = empresas.filter(e => e.churned_at && e.churned_at >= mesAtras).length;

  // ── Filtros ──
  const filtradas = empresas.filter(e => {
    const termo = busca.toLowerCase();
    const matchBusca = !busca || (e.nome_fantasia ?? "").toLowerCase().includes(termo)
      || (e.user_email ?? "").toLowerCase().includes(termo)
      || (e.cidade ?? "").toLowerCase().includes(termo)
      || (e.cnpj ?? "").includes(termo);
    const matchPlano = !filtroPlano || (e.plano ?? "starter") === filtroPlano;
    const matchStatus = !filtroStatus || (e.lead_status ?? "novo") === filtroStatus;
    return matchBusca && matchPlano && matchStatus;
  });

  function exportCSV() {
    const headers = ["Nome","Email","CNPJ","Telefone","Cidade","Estado","Setor","Faturamento","Plano","Status Lead","Msgs","Próx. contato","Obs.","Churned em","Plano anterior","Cadastro"];
    const rows = filtradas.map(e => [
      e.nome_fantasia ?? "", e.user_email ?? "", e.cnpj ?? "", e.telefone ?? "",
      e.cidade ?? "", e.estado ?? "", SETOR_LABELS[e.setor ?? ""] ?? e.setor ?? "",
      FATURAMENTO_LABELS[e.faturamento ?? ""] ?? e.faturamento ?? "",
      PLANO_LABELS[e.plano ?? "starter"], e.lead_status ?? "novo",
      e.total_mensagens ?? 0, e.proximo_contato ?? "", e.observacoes ?? "",
      e.churned_at ? formatDate(e.churned_at) : "", e.plano_anterior ?? "", formatDate(e.created_at),
    ].map(v => `"${v}"`));
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `leads-gpj-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Carregando painel...</p>
      </div>
    </div>
  );
  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {editModal && (
        <LeadModal empresa={editModal} onClose={() => setEditModal(null)} onSave={handleSaveLead}
          onDelete={(e) => { setDeleteModal(e); }} />
      )}
      {deleteModal && (
        <DeleteModal empresa={deleteModal} onClose={() => setDeleteModal(null)} onConfirm={handleDeleteUser} />
      )}

      {/* Header */}
      <header className="bg-[#1B2A4A] text-white px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-pj.svg" alt="Meu Gerente PJ" className="w-9 h-9 object-contain" />
          <div>
            <p className="font-bold text-sm">Painel Admin</p>
            <div className="flex items-center gap-1"><Sparkles size={9} className="text-blue-300" /><p className="text-[10px] text-blue-300">Meu Gerente PJ</p></div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => loadData(true)} disabled={refreshing}
            className="flex items-center gap-1.5 text-blue-200/70 hover:text-white text-xs transition-colors">
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">{lastUpdated ? `${lastUpdated.getHours().toString().padStart(2,"0")}:${lastUpdated.getMinutes().toString().padStart(2,"0")}` : "Atualizar"}</span>
          </button>
          <button onClick={() => router.push("/dashboard")} className="flex items-center gap-1.5 text-blue-200/70 hover:text-white text-xs">
            <ArrowLeft size={14} /><span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">

        {/* ── FUNIL ── */}
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <BarChart3 size={14} /> Funil de Conversão
          </h2>
          <div className="flex gap-3 items-stretch">
            <FunnelBar label="Visitantes únicos" value={stats.visitantes} total={stats.visitantes} color="bg-slate-600" icon={Eye} />
            <div className="flex items-center text-gray-300 font-bold text-lg self-center">›</div>
            <FunnelBar label="Cadastros" value={total} total={stats.visitantes} color="bg-blue-600" icon={Users} />
            <div className="flex items-center text-gray-300 font-bold text-lg self-center">›</div>
            <FunnelBar label="Leads quentes" value={leadsQuentes} total={total} color="bg-orange-500" icon={Zap} />
            <div className="flex items-center text-gray-300 font-bold text-lg self-center">›</div>
            <FunnelBar label="Assinantes pagos" value={pagos} total={total} color="bg-green-600" icon={TrendingUp} />
            <div className="flex items-center text-gray-300 font-bold text-lg self-center">›</div>
            <FunnelBar label="Churns acum." value={churned} total={pagos + churned} color="bg-red-500" icon={TrendingDown} />
          </div>
        </div>

        {/* ── KPIs ── */}
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <TrendingUp size={14} /> KPIs
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
            <KpiCard label="Total cadastros" value={total} color="text-blue-600" />
            <KpiCard label="Novos hoje" value={stats.novosHoje} color="text-green-600" />
            <KpiCard label="Novos (7 dias)" value={stats.novosSemana} color="text-blue-500" />
            <KpiCard label="MRR atual" value={`R$${mrr.toLocaleString("pt-BR")}`} color="text-green-600" sub="Receita mensal" />
            <KpiCard label="Taxa conversão" value={`${taxaConv}%`} color="text-amber-600" sub={`${pagos} pagantes`} />
            <KpiCard label="Churns (30d)" value={churnMes} color="text-red-600" warn={churnMes > 0} sub={churnMes > 0 ? "Atenção" : "Nenhum"} />
            <KpiCard label="Churn rate" value={`${churnRate}%`} color="text-red-600" warn={parseFloat(churnRate) > 5}
              sub={mrrPerdido > 0 ? `R$${mrrPerdido.toLocaleString("pt-BR")} MRR perdido` : undefined} />
          </div>
        </div>

        {/* ── FILTROS ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Buscar por nome, email, CNPJ, cidade..."
                value={busca} onChange={e => setBusca(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>
            <select value={filtroPlano} onChange={e => setFiltroPlano(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-600">
              <option value="">Todos os planos</option>
              {PLANOS.map(p => <option key={p} value={p}>{PLANO_LABELS[p]}</option>)}
            </select>
            <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-600">
              <option value="">Todos os status</option>
              {STATUS_LEAD.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#1B2A4A] text-white text-sm rounded-xl hover:bg-[#243660] font-medium flex-shrink-0">
              <Download size={14} /> CSV
            </button>
          </div>
          {(busca || filtroPlano || filtroStatus) && (
            <p className="text-xs text-gray-400 mt-2">{filtradas.length} resultado{filtradas.length !== 1 ? "s" : ""}</p>
          )}
        </div>

        {/* ── TABELA ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filtradas.length === 0 ? (
            <div className="py-16 text-center"><Users size={32} className="text-gray-200 mx-auto mb-3" /><p className="text-sm text-gray-400">Nenhuma empresa encontrada</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80">
                    {["Empresa / Email","Plano","Status","Msgs","Local","Cadastro","Ações"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtradas.map(e => {
                    const iniciais = (e.nome_fantasia || "?").split(" ").slice(0, 2).map((p: string) => p[0]).join("").toUpperCase().slice(0, 2);
                    const statusInfo = STATUS_LEAD.find(s => s.value === (e.lead_status ?? "novo")) ?? STATUS_LEAD[0];
                    const planoColor = PLANO_COLORS[e.plano ?? "starter"];
                    const isQuente = (e.total_mensagens ?? 0) >= 10 && (e.plano ?? "starter") === "starter";
                    const isChurned = !!e.churned_at;
                    const expanded = expandedRow === e.id;

                    return (
                      <>
                        <tr key={e.id} className={`hover:bg-gray-50/60 transition-colors ${isQuente ? "bg-orange-50/30" : ""} ${isChurned ? "bg-red-50/20" : ""}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="relative">
                                <div className="w-8 h-8 rounded-lg bg-[#1B2A4A] flex items-center justify-center text-white font-bold text-[11px] flex-shrink-0">{iniciais}</div>
                                {isQuente && <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border border-white" title="Lead quente" />}
                                {isChurned && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" title="Churned" />}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 text-[13px] truncate max-w-[140px]">{e.nome_fantasia || "—"}</p>
                                <p className="text-[11px] text-gray-400 truncate max-w-[140px]">{e.user_email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${planoColor}`}>{PLANO_LABELS[e.plano ?? "starter"]}</span>
                              {isChurned && e.plano_anterior && (
                                <p className="text-[10px] text-red-400 mt-0.5 flex items-center gap-0.5"><TrendingDown size={9} />era {PLANO_LABELS[e.plano_anterior]}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusInfo.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />{statusInfo.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[12px] font-mono font-semibold ${isQuente ? "text-orange-600" : "text-gray-600"}`}>{e.total_mensagens ?? 0}/10</span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-[12px] text-gray-600 whitespace-nowrap">{[e.cidade, e.estado].filter(Boolean).join(", ") || "—"}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-[12px] text-gray-500 whitespace-nowrap">{formatDate(e.created_at)}</p>
                            {e.proximo_contato && (
                              <p className="text-[10px] text-blue-500 flex items-center gap-0.5 mt-0.5">
                                <Calendar size={9} />{new Date(e.proximo_contato).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                              </p>
                            )}
                            {isChurned && e.churned_at && (
                              <p className="text-[10px] text-red-400 flex items-center gap-0.5 mt-0.5">
                                <TrendingDown size={9} />churn {formatDate(e.churned_at)}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {e.whatsapp && (
                                <a href={`https://wa.me/55${e.whatsapp.replace(/\D/g, "")}?text=Ol%C3%A1%2C+vi+que+voc%C3%AA+est%C3%A1+usando+o+Meu+Gerente+PJ!`}
                                  target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100">
                                  <Phone size={13} />
                                </a>
                              )}
                              <a href={`mailto:${e.user_email}?subject=Meu+Gerente+PJ`} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                                <Mail size={13} />
                              </a>
                              <button onClick={() => setEditModal(e)} className="p-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100">
                                <Edit3 size={13} />
                              </button>
                              <button onClick={() => setDeleteModal(e)} className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600">
                                <Trash2 size={13} />
                              </button>
                              <button onClick={() => setExpandedRow(expanded ? null : e.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                                {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {expanded && (
                          <tr key={`${e.id}-detail`} className="bg-blue-50/20">
                            <td colSpan={7} className="px-6 py-4">
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-[12px]">
                                <div><p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Setor</p><p>{SETOR_LABELS[e.setor ?? ""] || "—"}</p></div>
                                <div><p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Faturamento</p><p>{FATURAMENTO_LABELS[e.faturamento ?? ""] || "—"}</p></div>
                                <div><p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Regime</p><p>{e.regime || "—"}</p></div>
                                <div><p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Funcionários</p><p>{e.num_funcionarios || "—"}</p></div>
                                <div><p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Contador</p>
                                  <div className="flex items-center gap-1">{e.tem_contador ? <><CheckCircle2 size={12} className="text-green-500" /><span>Sim</span></> : <><XCircle size={12} className="text-red-400" /><span>Não</span></>}</div>
                                </div>
                                <div><p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Como conheceu</p><p>{e.como_conheceu || "—"}</p></div>
                                {e.observacoes && (
                                  <div className="md:col-span-2"><p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Observações</p>
                                    <p className="bg-yellow-50 rounded-lg px-2 py-1.5 text-[11px] text-gray-700">{e.observacoes}</p>
                                  </div>
                                )}
                                {(e.principais_desafios ?? []).length > 0 && (
                                  <div className="md:col-span-2"><p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Desafios</p>
                                    <div className="flex flex-wrap gap-1">{e.principais_desafios!.map(d => <span key={d} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[11px]">{d}</span>)}</div>
                                  </div>
                                )}
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

        <p className="text-center text-xs text-gray-400 pb-4">Painel admin · {filtradas.length} de {total} registros</p>
      </div>
    </div>
  );
}
