import { Building2 } from "lucide-react";
import ChatInterface from "@/components/chat/ChatInterface";

const sugestoes = [
  "Tenho R$80k parado na conta PJ. Onde rende mais mantendo liquidez diária?",
  "CDB a 110% do CDI ou Tesouro Selic — qual é melhor para PJ?",
  "LCI e LCA são isentos de IR para pessoa jurídica também?",
  "Qual o rendimento líquido de um CDB a 13,5% ao ano com IR de 15%?",
];

export default function InvestimentosPage() {
  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center gap-3 flex-shrink-0">
        <div className="p-2 bg-teal-50 rounded-xl">
          <Building2 size={18} className="text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-[14px] text-gray-900">Investimentos PJ</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">CDB · Tesouro Direto · LCI · LCA · Rendimento líquido com IR</p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-600 px-2.5 py-1 rounded-full flex-shrink-0">
          IR já calculado
        </span>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          modulo="investimentos"
          placeholderInicial="Ex: Tenho R$50k na conta PJ — onde investir com liquidez e menor IR?"
          sugestoesIniciais={sugestoes}
          corDestaque="bg-teal-600"
        />
      </div>
    </div>
  );
}
