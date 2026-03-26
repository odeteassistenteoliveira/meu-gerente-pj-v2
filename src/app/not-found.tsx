import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] via-[#1e3060] to-[#0f1d36] flex items-center justify-center px-4">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
        backgroundSize: "32px 32px"
      }} />

      <div className="text-center relative max-w-md">
        {/* Logo */}
        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center font-bold text-white text-xl mx-auto mb-6 shadow-xl shadow-blue-900/40">
          GP
        </div>

        {/* Número 404 */}
        <p className="text-8xl font-black text-white/10 select-none leading-none mb-2">404</p>

        <div className="flex items-center justify-center gap-1.5 mb-3">
          <Sparkles size={14} className="text-blue-300" />
          <p className="text-sm text-blue-300 font-medium">Meu Gerente PJ</p>
        </div>

        <h1 className="text-2xl font-black text-white mb-3">Página não encontrada</h1>
        <p className="text-blue-200/70 text-sm leading-relaxed mb-8">
          O endereço que você tentou acessar não existe ou foi movido. Mas seu consultor financeiro continua à disposição!
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-white text-[#1B2A4A] font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm shadow-lg"
          >
            Ir para o Dashboard
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-blue-300 hover:text-white transition-colors text-sm font-medium px-4 py-3"
          >
            <ArrowLeft size={14} />
            Página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
