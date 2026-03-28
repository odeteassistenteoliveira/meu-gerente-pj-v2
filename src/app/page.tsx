import Link from "next/link";
import {
  Calculator, CreditCard, TrendingUp, Landmark, Building2,
  ArrowRight, Star, Shield, Zap, ChevronDown, CheckCircle
} from "lucide-react";
import PlanosSection from "@/components/landing/PlanosSection";

const modulos = [
  { icon: Calculator,  cor: "bg-blue-50 text-blue-600",   label: "Calculadora Financeira",   desc: "Juros compostos, antecipação de recebíveis, capital de giro e ponto de equilíbrio — tudo em linguagem simples." },
  { icon: CreditCard,  cor: "bg-purple-50 text-purple-600", label: "Simulador de Crédito",  desc: "Compare BNDES, Pronampe e capital de giro. Veja o CET real sem viés de banco." },
  { icon: TrendingUp,  cor: "bg-orange-50 text-orange-600", label: "Taxas & Tarifas",       desc: "Descubra se está pagando caro na maquininha, conta PJ, Pix ou boleto." },
  { icon: Landmark,    cor: "bg-green-50 text-green-600",   label: "Especialista Bancário", desc: "Horários de TED, compensação de boleto, dias úteis e regras do Bacen." },
  { icon: Building2,   cor: "bg-teal-50 text-teal-600",     label: "Investimentos PJ",      desc: "CDB, Tesouro Direto, LCI e LCA com rendimento líquido já descontado o IR." },
];

const depoimentos = [
  { nome: "Carlos Mendes", empresa: "Distribuidora Mendes", setor: "Comércio · R$4MM/ano", texto: "Descobri que estava pagando R$2.800/mês a mais na maquininha. Em 10 minutos o Gerente PJ me mostrou qual trocar." },
  { nome: "Ana Souza",     empresa: "Clínica Bem Estar",    setor: "Saúde · R$1,8MM/ano",  texto: "Finalmente entendi a diferença entre Pronampe e capital de giro. Escolhi a linha certa e economizei R$18k em juros." },
  { nome: "Roberto Lima",  empresa: "Lima Construções",     setor: "Construção · R$7MM/ano", texto: "Tinha R$120k parado em conta corrente sem render nada. O Gerente PJ me mostrou onde investir com liquidez diária." },
];

const faqs = [
  { p: "O Meu Gerente PJ substitui meu contador?", r: "Não — e nem quer. O contador cuida de obrigações fiscais e legais. O Gerente PJ resolve as dúvidas financeiras do dia a dia que você não consegue tirar com o contador: comparar taxas, simular crédito, entender regras bancárias e decidir onde investir o caixa." },
  { p: "Os dados da minha empresa ficam seguros?", r: "Sim. Usamos criptografia em trânsito e em repouso, banco de dados isolado por usuário e seguimos todas as diretrizes da LGPD. Seus dados nunca são compartilhados com bancos ou terceiros." },
  { p: "A IA pode me dar uma resposta errada?", r: "A IA é treinada com dados financeiros brasileiros atualizados — taxas Selic, CDI, regras Bacen, linhas de crédito. Para decisões de alto valor (acima de R$500k), sempre recomendamos confirmar com um especialista humano." },
  { p: "Posso cancelar quando quiser?", r: "Sim. Sem fidelidade, sem multa. Cancele a qualquer momento pelo painel — o acesso continua até o fim do período pago." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navbar ─────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-pj.svg" alt="Meu Gerente PJ" className="w-9 h-9 object-contain" />
            <span className="font-bold text-gray-900 text-[15px]">Meu Gerente PJ</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
            <a href="#funcionalidades" className="hover:text-gray-900 transition-colors">Funcionalidades</a>
            <a href="#planos" className="hover:text-gray-900 transition-colors">Planos</a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
              Entrar no APP
            </Link>
            <Link href="/cadastro" className="bg-[#1B2A4A] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#243660] transition-colors hidden md:block">
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-5 md:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Zap size={11} />
            IA com experiência de 20+ anos · CEA & CFP · MBA Finanças
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight tracking-tight mb-6">
            Seu gerente financeiro<br />
            <span className="text-[#1B2A4A]">de bolso</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8">
            Simule crédito, compare taxas, tire dúvidas bancárias e descubra onde investir o caixa — tudo em linguagem simples, sem viés de banco, disponível 24h.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/cadastro" className="w-full sm:w-auto bg-[#1B2A4A] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#243660] transition-all text-base flex items-center justify-center gap-2 shadow-lg shadow-[#1B2A4A]/20">
              Começar grátis — sem cartão
              <ArrowRight size={17} />
            </Link>
            <a href="#funcionalidades" className="w-full sm:w-auto text-gray-600 font-medium px-6 py-4 rounded-xl hover:bg-gray-50 transition-colors text-sm border border-gray-200 flex items-center justify-center gap-2">
              Ver como funciona
              <ChevronDown size={15} />
            </a>
          </div>
          <p className="text-xs text-gray-400 mt-4">Grátis para sempre · Sem cartão · Cancele quando quiser</p>

          {/* Compartilhar via WhatsApp */}
          <div className="mt-6">
            <a
              href={`https://wa.me/?text=${encodeURIComponent("💼 Achei uma IA que funciona como gerente financeiro para empresários PJ!\n\nResponde dúvidas sobre taxas, crédito, investimentos e regras bancárias — 24h, sem viés de banco e grátis para começar.\n\n👉 https://meu-gerente-pj.vercel.app")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 transition-colors font-medium"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Compartilhar com um amigo empresário
            </a>
          </div>
        </div>

        {/* Prova social rápida */}
        <div className="max-w-2xl mx-auto mt-10 sm:mt-14 grid grid-cols-3 gap-3 sm:gap-6 text-center">
          {[
            { num: "5", label: "Especialistas em 1 plataforma" },
            { num: "24h", label: "Disponível sempre" },
            { num: "R$0", label: "Para começar" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl sm:text-3xl font-black text-[#1B2A4A]">{s.num}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Dor do empresário ──────────────────────────── */}
      <section className="py-16 px-5 md:px-8 bg-[#1B2A4A]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-wider mb-4">Você já se perguntou...</p>
          <div className="grid md:grid-cols-2 gap-3 text-left">
            {[
              "\"Minha maquininha cobra 3,2% no crédito. Isso é caro ou normal?\"",
              "\"Qual a diferença real entre Pronampe e capital de giro?\"",
              "\"Se pagar o boleto hoje às 18h, compensa amanhã ou segunda?\"",
              "\"Tenho R$80k parado na conta PJ. Onde rende com liquidez?\"",
            ].map((q) => (
              <div key={q} className="bg-white/8 border border-white/10 rounded-xl px-5 py-4">
                <p className="text-white text-sm leading-relaxed italic">{q}</p>
              </div>
            ))}
          </div>
          <p className="text-blue-200 mt-8 text-base">
            O Meu Gerente PJ responde tudo isso — <strong className="text-white">em segundos, a qualquer hora, sem fila de banco.</strong>
          </p>
        </div>
      </section>

      {/* ── Funcionalidades ────────────────────────────── */}
      <section id="funcionalidades" className="py-20 px-5 md:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">5 especialistas em 1</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">Cada módulo resolve um problema real</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modulos.map((m) => (
              <div key={m.label} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${m.cor}`}>
                  <m.icon size={20} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{m.label}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
              </div>
            ))}
            {/* Card CTA */}
            <div className="bg-[#1B2A4A] rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3">Em breve</p>
                <h3 className="font-bold text-white mb-2">Open Finance</h3>
                <p className="text-sm text-blue-200 leading-relaxed">Conecte sua conta bancária e receba análises personalizadas com seus dados reais.</p>
              </div>
              <Link href="/cadastro" className="mt-6 text-xs font-bold text-blue-300 hover:text-white transition-colors flex items-center gap-1">
                Entrar na lista de espera <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Depoimentos ────────────────────────────────── */}
      <section className="py-20 px-5 md:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Resultados reais</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">O que os empresários falam</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {depoimentos.map((d) => (
              <div key={d.nome} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5 italic">"{d.texto}"</p>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{d.nome}</p>
                  <p className="text-xs text-gray-400">{d.empresa} · {d.setor}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como instalar na tela inicial ──────────────── */}
      <section className="py-20 px-5 md:px-8 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Acesso rápido</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Adicione à tela inicial do seu celular</h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">Funciona como um app — sem precisar de App Store. Abra em 1 toque direto da tela inicial.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">

            {/* iOS */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                </div>
                <span className="font-bold text-gray-900">iPhone / iPad (Safari)</span>
              </div>
              <div className="space-y-4">
                {[
                  { step: "1", text: "Abra o site no Safari e toque no ícone de compartilhar", icon: "↑□" },
                  { step: "2", text: "Role para baixo e toque em \"Adicionar à Tela de Início\"", icon: "＋" },
                  { step: "3", text: "Confirme o nome e toque em \"Adicionar\" — pronto!", icon: "✓" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-[#1B2A4A] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">{item.step}</div>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Android */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M17.523 15.341c-.33.195-.75.065-.946-.266l-1.961-3.393a.693.693 0 0 0-.946-.265l-1.174.678a.693.693 0 0 1-.946-.265L9.39 8.437a.693.693 0 0 0-.946-.265L6.477 9.35A6.998 6.998 0 0 0 5 13c0 3.866 3.134 7 7 7s7-3.134 7-7c0-1.502-.472-2.894-1.276-4.03l-1.201.371zm-5.536-9.202L10.32 9.532l1.174-.678c.33-.195.75-.065.946.266l2.159 3.739 1.174-.678c.33-.195.75-.065.946.266l1.2 2.078A6.965 6.965 0 0 0 19 11c0-3.524-2.61-6.432-6.013-6.912zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/></svg>
                </div>
                <span className="font-bold text-gray-900">Android (Chrome)</span>
              </div>
              <div className="space-y-4">
                {[
                  { step: "1", text: "Abra o site no Chrome e toque no menu ⋮ (três pontinhos)", icon: "⋮" },
                  { step: "2", text: "Toque em \"Adicionar à tela inicial\" no menu", icon: "＋" },
                  { step: "3", text: "Confirme e o ícone aparece na sua tela — acesso em 1 toque!", icon: "✓" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-[#1B2A4A] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">{item.step}</div>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/cadastro" className="inline-flex items-center gap-2 bg-[#1B2A4A] text-white font-bold px-7 py-3.5 rounded-xl hover:bg-[#243660] transition-all text-sm shadow-md shadow-[#1B2A4A]/20">
              Criar conta e instalar agora
              <ArrowRight size={15} />
            </Link>
            <p className="text-xs text-gray-400 mt-3">Funciona offline · Abre em 1 toque · Sem ocupar espaço de app</p>
          </div>
        </div>
      </section>

      {/* ── Planos ─────────────────────────────────────── */}
      <PlanosSection />

      {/* ── Segurança ──────────────────────────────────── */}
      <section className="py-14 px-5 md:px-8 bg-slate-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            {[
              { icon: Shield, label: "LGPD", desc: "Dados protegidos por lei" },
              { icon: Zap,    label: "24/7",  desc: "Disponível sempre" },
              { icon: Star,   label: "CEA & CFP", desc: "Certificações financeiras" },
              { icon: CheckCircle, label: "Sem viés", desc: "Independente de bancos" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-[#1B2A4A] rounded-xl flex items-center justify-center">
                  <item.icon size={18} className="text-blue-300" />
                </div>
                <p className="font-bold text-gray-900 text-sm">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────── */}
      <section id="faq" className="py-20 px-5 md:px-8 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900">Perguntas frequentes</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((f) => (
              <div key={f.p} className="border border-gray-200 rounded-xl p-5">
                <p className="font-bold text-gray-900 text-sm mb-2">{f.p}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{f.r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ──────────────────────────────────── */}
      <section className="py-20 px-5 md:px-8 bg-[#1B2A4A]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Seu gerente financeiro está esperando
          </h2>
          <p className="text-blue-300 mb-8 leading-relaxed">
            Comece hoje de graça. Sem cartão, sem burocracia — só você e seu consultor financeiro com IA.
          </p>
          <Link href="/cadastro" className="inline-flex items-center gap-2 bg-white text-[#1B2A4A] font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all text-base shadow-lg">
            Criar conta gratuita
            <ArrowRight size={17} />
          </Link>
          <div className="mt-5">
            <a
              href={`https://wa.me/?text=${encodeURIComponent("💼 Você precisa conhecer o Meu Gerente PJ!\n\nÉ uma IA que responde dúvidas financeiras para empresários: simula crédito, compara taxas, investimentos e regras bancárias — tudo em linguagem simples, 24h por dia.\n\n🎁 Grátis para começar, sem cartão!\n\n👉 https://meu-gerente-pj.vercel.app")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Indicar para um amigo empresário
            </a>
          </div>
          <p className="text-blue-400/60 text-xs mt-4">Gerente com 20+ anos de experiência · CEA & CFP · Dados protegidos pela LGPD</p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="py-8 px-5 md:px-8 bg-gray-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-pj.svg" alt="Meu Gerente PJ" className="w-7 h-7 object-contain" />
            <span className="text-gray-400 text-sm font-medium">Meu Gerente PJ</span>
          </div>
          <p className="text-gray-500 text-xs text-center">© 2026 Meu Gerente PJ. Todos os direitos reservados. · LGPD compliance</p>
          <div className="flex gap-4 text-xs text-gray-500">
            <Link href="/login" className="hover:text-gray-300 transition-colors">Login</Link>
            <Link href="/cadastro" className="hover:text-gray-300 transition-colors">Cadastrar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
