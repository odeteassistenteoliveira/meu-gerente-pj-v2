"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);

  useEffect(() => {
    // Detect if already running as standalone (installed)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    // Listen for beforeinstallprompt (Chrome/Android)
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (isIOS) {
      setShowIOSTip(true);
      return;
    }
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setInstallPrompt(null);
  }

  // Hide if already installed or no install available (non-iOS, no prompt)
  if (isInstalled) return null;
  if (!installPrompt && !isIOS) return null;

  return (
    <>
      <button
        onClick={handleInstall}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
        title="Instalar o APP no dispositivo"
      >
        <Download size={12} />
        Instalar APP
      </button>

      {/* iOS tip modal */}
      {showIOSTip && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 pb-safe"
          onClick={() => setShowIOSTip(false)}
        >
          <div
            className="bg-white rounded-t-3xl p-6 max-w-sm w-full mx-4 mb-0"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#1B2A4A] rounded-xl flex items-center justify-center">
                <Smartphone size={18} className="text-blue-300" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Instalar no iPhone / iPad</p>
                <p className="text-xs text-gray-500">Adicione à tela inicial em 2 passos</p>
              </div>
            </div>
            <ol className="space-y-2 text-sm text-gray-700 mb-5">
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#1B2A4A] flex-shrink-0">1.</span>
                Toque no ícone de compartilhar <span className="inline-block px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">⬆</span> no Safari
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#1B2A4A] flex-shrink-0">2.</span>
                Selecione <strong>"Adicionar à Tela de Início"</strong>
              </li>
            </ol>
            <button
              onClick={() => setShowIOSTip(false)}
              className="w-full bg-[#1B2A4A] text-white font-bold py-3 rounded-xl text-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
