import { Calculator } from "lucide-react";
import ChatInterface from "@/components/chat/ChatInterface";

const sugestoes = [
  "Se eu pegar R$50.000 a 2,5% ao mês por 12 meses, qual a parcela e o custo total?",
  "Vale a pena antecipar R$30.000 em recebíveis com taxa de 1,8% ao mês por 45 dias?",
  "Preciso de R$20k de capital de giro. Meu giro médio é de 30 dias — qual o custo?",
  "Meu produto custa R$80 e tenho R$15k de custo fixo. Qual meu ponto de equilíbrio?",
];

export default function CalculadoraPage() {
  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center gap-3 flex-shrink-0">
        <div className="p-2 bg-blue-50 rounded-xl">
          <Calculator size={18} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-[14px] text-gray-900">Calculadora Financeira</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">Juros compostos · Antecipação · Capital de giro · Ponto de equilíbrio</p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full flex-shrink-0">
          Juros & Fluxo
        </span>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          modulo="calculadora"
          placeholderInicial="Ex: Quanto pago no total se financiar R$100k a 1,9% ao mês por 36 meses?"
          sugestoesIniciais={sugestoes}
          corDestaque="bg-blue-600"
        />
      </div>
    </div>
  );
}
