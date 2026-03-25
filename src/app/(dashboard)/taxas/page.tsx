import { TrendingUp } from "lucide-react";
import ChatInterface from "@/components/chat/ChatInterface";

const sugestoes = [
  "Pago 2,99% no crédito à vista na maquininha. Isso é caro para o meu setor?",
  "Qual a maquininha mais barata para quem fatura R$80k por mês no crédito parcelado?",
  "Meu banco cobra R$0,40 por Pix recebido. É normal para conta PJ?",
  "Quais os custos de manter uma conta PJ no Itaú vs. Nubank PJ?",
];

export default function TaxasPage() {
  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center gap-3 flex-shrink-0">
        <div className="p-2 bg-orange-50 rounded-xl">
          <TrendingUp size={18} className="text-orange-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-[14px] text-gray-900">Taxas & Tarifas</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">Maquininha · Conta PJ · Pix · Boleto · Comparativo de mercado</p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full flex-shrink-0">
          Maquininha & Conta PJ
        </span>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          modulo="taxas"
          placeholderInicial="Ex: Pago 2,99% no crédito à vista — isso é bom ou caro para o meu segmento?"
          sugestoesIniciais={sugestoes}
          corDestaque="bg-orange-500"
        />
      </div>
    </div>
  );
}
