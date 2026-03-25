import { Landmark } from "lucide-react";
import ChatInterface from "@/components/chat/ChatInterface";

const sugestoes = [
  "Se eu pagar um boleto hoje às 19h, quando ele compensa?",
  "Qual o limite de Pix por transação para pessoa jurídica?",
  "Meu cliente quer fazer TED. Até que horas funciona no Bradesco?",
  "O cheque ainda é compensado em D+1? Quais os riscos de aceitar?",
];

export default function BancarioPage() {
  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center gap-3 flex-shrink-0">
        <div className="p-2 bg-green-50 rounded-xl">
          <Landmark size={18} className="text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-[14px] text-gray-900">Especialista Bancário</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">Horários · Compensação · Dias úteis · Pix · Câmbio · Regras Bacen</p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600 px-2.5 py-1 rounded-full flex-shrink-0">
          Regras do Bacen
        </span>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          modulo="bancario"
          placeholderInicial="Ex: Se pagar o boleto hoje às 18h, compensa amanhã ou só depois de amanhã?"
          sugestoesIniciais={sugestoes}
          corDestaque="bg-green-600"
        />
      </div>
    </div>
  );
}
