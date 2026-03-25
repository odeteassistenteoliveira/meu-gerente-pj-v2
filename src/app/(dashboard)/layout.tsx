"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calculator, CreditCard, Building2, TrendingUp, Landmark,
  LayoutDashboard, LogOut, Menu, X, Sparkles, ShieldCheck, UserCog, Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const modulos = [
  { href: "/dashboard",    label: "Início",              icon: LayoutDashboard },
  { href: "/calculadora",  label: "Calculadora",         icon: Calculator      },
  { href: "/credito",      label: "Simulador de Crédito",icon: CreditCard      },
  { href: "/taxas",        label: "Taxas & Tarifas",     icon: TrendingUp      },
  { href: "/bancario",     label: "Especialista Bancário",icon: Landmark       },
  { href: "/investimentos",label: "Investimentos PJ",    icon: Building2       },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [email, setEmail] = useState("");
  const [plano, setPlano] = useState("Starter");
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      const { data } = await supabase
        .from("empresas").select("nome_fantasia, plano").eq("user_id", user.id).single();
      if (data) {
        setNomeEmpresa(data.nome_fantasia ?? "");
        setPlano(data.plano === "pro" ? "Pro" : "Starter");
      }
    }
    load();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const iniciais = nomeEmpresa
    ? nomeEmpresa.split(" ").slice(0, 2).map((p: string) => p[0]).join("").toUpperCase()
    : email ? email[0].toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar Desktop ─────────────────────────── */}
      <aside className="hidden md:flex flex-col w-56 bg-[#1B2A4A] text-white fixed h-full z-30">

        {/* Logo */}
        <div className="px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center font-black text-[11px] shadow">
              GP
            </div>
            <div>
              <p className="font-bold text-[12px] leading-tight">Meu Gerente PJ</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Sparkles size={9} className="text-blue-300" />
                <p className="text-[10px] text-blue-300">Consultor Financeiro IA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {modulos.map((m) => {
            const ativo = pathname === m.href;
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 text-[12px] font-medium ${
                  ativo ? "nav-item-active" : "text-blue-100/70 hover:bg-white/8 hover:text-white"
                }`}
              >
                <m.icon size={15} className={ativo ? "text-white" : "text-blue-300/70 group-hover:text-white transition-colors"} />
                <span>{m.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Upgrade banner (só para Starter) */}
        {plano === "Starter" && (
          <div className="px-2 pb-1">
            <Link
              href="/upgrade"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-400/20 hover:from-blue-500/30 hover:to-blue-600/30 transition-all"
            >
              <Zap size={13} className="text-yellow-300 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white leading-tight">Fazer upgrade</p>
                <p className="text-[10px] text-blue-300/80 leading-tight">Planos a partir de R$97/mês</p>
              </div>
            </Link>
          </div>
        )}

        {/* Perfil link */}
        <div className="px-2 pb-0.5">
          <Link
            href="/perfil"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all duration-150 ${
              pathname === "/perfil" ? "nav-item-active" : "text-blue-100/70 hover:bg-white/8 hover:text-white"
            }`}
          >
            <UserCog size={15} className={pathname === "/perfil" ? "text-white" : "text-blue-300/70"} />
            <span>Meu Perfil</span>
          </Link>
        </div>

        {/* Admin link */}
        {email === "renankz@gmail.com" && (
          <div className="px-2 pb-1">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-medium text-yellow-300/80 hover:bg-white/8 hover:text-yellow-200 transition-all"
            >
              <ShieldCheck size={14} className="text-yellow-400" />
              <span>Painel Admin</span>
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="px-2 py-3 border-t border-white/10 space-y-1">
          {/* Usuário */}
          <div className="px-3 py-2.5 rounded-lg bg-white/6 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/40 flex items-center justify-center text-[11px] font-bold text-blue-100 flex-shrink-0">
              {iniciais}
            </div>
            <div className="min-w-0">
              {nomeEmpresa && (
                <p className="text-[11px] font-semibold text-white truncate leading-tight">{nomeEmpresa}</p>
              )}
              <p className="text-[10px] text-blue-300/70 truncate">{email}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                <span className="text-[9px] text-blue-300/70 font-medium">Plano {plano}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-blue-200/60 hover:bg-white/8 hover:text-white transition-all text-[12px]"
          >
            <LogOut size={13} />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Header ──────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-[#1B2A4A] text-white z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center font-black text-[10px]">GP</div>
          <span className="font-bold text-[13px]">Meu Gerente PJ</span>
        </div>
        <button onClick={() => setMenuAberto(!menuAberto)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
          {menuAberto ? <X size={19} /> : <Menu size={19} />}
        </button>
      </header>

      {/* ── Mobile Menu ─────────────────────────────── */}
      {menuAberto && (
        <div className="md:hidden fixed inset-0 bg-[#1B2A4A] z-30 pt-16 overflow-y-auto">
          <nav className="px-3 py-3 space-y-0.5">
            {modulos.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                onClick={() => setMenuAberto(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium transition-all ${
                  pathname === m.href ? "nav-item-active" : "text-blue-100/80"
                }`}
              >
                <m.icon size={18} />
                <span>{m.label}</span>
              </Link>
            ))}
          </nav>
          <div className="px-3 py-3 border-t border-white/10 mt-2">
            {nomeEmpresa && (
              <div className="px-4 py-3 rounded-xl mb-2">
                <p className="text-[12px] font-semibold text-white">{nomeEmpresa}</p>
                <p className="text-[11px] text-blue-300">{email}</p>
              </div>
            )}
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 text-[13px]">
              <LogOut size={16} />
              <span>Sair da conta</span>
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo */}
      <main className="flex-1 md:ml-56 pt-14 md:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
