"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-6 text-center">
      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
        <AlertTriangle size={26} className="text-red-400" />
      </div>
      <h2 className="text-lg font-bold text-gray-800 mb-2">Algo deu errado</h2>
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-6">
        Ocorreu um erro inesperado. Por favor, tente novamente. Se o problema
        persistir, entre em contato pelo suporte.
      </p>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 bg-[#1B2A4A] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#243660] transition-colors"
      >
        <RefreshCw size={14} />
        Tentar novamente
      </button>
    </div>
  );
}
