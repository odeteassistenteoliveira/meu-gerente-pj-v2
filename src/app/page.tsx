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

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-[#1B2A4A] rounded-lg flex items-center justify-center font-black text-white text-xs">GP</div>
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

      {/* Hero */}
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
        </div>

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

      {/* Dor do empresário */}
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

      {/* Funcionalidades */}
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

      {/* Depoimentos */}
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

      {/* Planos */}
      <PlanosSection />

      {/* Segurança */}
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

      {/* FAQ */}
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

      {/* CTA Final */}
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
          <p className="text-blue-400/60 text-xs mt-4">Gerente com 20+ anos de experiência · CEA & CFP · Dados protegidos pela LGPD</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-5 md:px-8 bg-gray-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-md flex items-center justify-center font-black text-white text-[9px]">GP</div>
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
