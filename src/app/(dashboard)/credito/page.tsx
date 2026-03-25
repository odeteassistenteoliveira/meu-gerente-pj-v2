import { CreditCard } from "lucide-react";
import ChatInterface from "@/components/chat/ChatInterface";

const sugestoes = [
  "Preciso de R$200.000 para comprar equipamentos. Qual linha de crédito é mais barata?",
  "Me enquadro no Pronampe? Minha empresa fatura R$2,5MM por ano.",
  "Qual a diferença entre capital de giro e antecipação de recebíveis?",
  "O banco me ofereceu crédito a 1,99% ao mês. É uma boa taxa?",
];

export default function CreditoPage() {
  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center gap-3 flex-shrink-0">
        <div className="p-2 bg-purple-50 rounded-xl">
          <CreditCard size={18} className="text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-[14px] text-gray-900">Simulador de Crédito</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">BNDES · Pronampe · Capital de giro · Antecipação · CET real</p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full flex-shrink-0">
          Sem viés bancário
        </span>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          modulo="credito"
          placeholderInicial="Ex: Preciso de R$150k para capital de giro — qual a opção mais barata?"
          sugestoesIniciais={sugestoes}
          corDestaque="bg-purple-600"
        />
      </div>
    </div>
  );
}
