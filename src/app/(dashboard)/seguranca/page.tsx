"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Shield, Loader2, CheckCircle2, Smartphone, AlertTriangle, Copy } from "lucide-react";

type MfaStatus = "loading" | "disabled" | "enrolling" | "enabled";

export default function SegurancaPage() {
  const [status, setStatus] = useState<MfaStatus>("loading");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [factorId, setFactorId] = useState("");
  const [code, setCode] = useState("");
  const [erro, setErro] = useState("");
  const [desabilitando, setDesabilitando] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    checkMfaStatus();
  }, []);

  async function checkMfaStatus() {
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      const totpFactor = data?.totp?.find((f) => f.status === "verified");
      if (totpFactor) {
        setFactorId(totpFactor.id);
        setStatus("enabled");
      } else {
        setStatus("disabled");
      }
    } catch {
      setStatus("disabled");
    }
  }

  async function handleEnroll() {
    setErro("");
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Meu Gerente PJ",
      });

      if (error || !data) {
        setErro(error?.message || "Erro ao iniciar configuração MFA.");
        return;
      }

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setStatus("enrolling");
    } catch {
      setErro("Erro de conexão.");
    }
  }

  async function handleVerify() {
    setErro("");
    if (code.length !== 6) {
      setErro("O código deve ter 6 dígitos.");
      return;
    }

    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) {
        setErro(challenge.error.message);
        return;
      }

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code,
      });

      if (verify.error) {
        setErro("Código inválido. Tente novamente.");
        return;
      }

      setStatus("enabled");
      setQrCode("");
      setSecret("");
      setCode("");
    } catch {
      setErro("Erro ao verificar código.");
    }
  }

  async function handleDisable() {
    setDesabilitando(true);
    setErro("");
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) {
        setErro(error.message);
      } else {
        setStatus("disabled");
        setFactorId("");
      }
    } catch {
      setErro("Erro ao desativar MFA.");
    } finally {
      setDesabilitando(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-gray-400" size={24} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Segurança da Conta</h1>
          <p className="text-xs text-gray-500">Autenticação em dois fatores (MFA)</p>
        </div>
      </div>

      {/* Status: MFA Desativado */}
      {status === "disabled" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={24} className="text-amber-500" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900 mb-1">MFA não ativado</h2>
              <p className="text-sm text-gray-500 mb-4">
                A autenticação em dois fatores adiciona uma camada extra de segurança à sua conta.
                Ao ativar, além da senha, você precisará digitar um código gerado pelo seu celular a cada login.
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Compatível com Google Authenticator, Authy, Microsoft Authenticator e outros apps TOTP.
              </p>
              <button
                onClick={handleEnroll}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1B2A4A] text-white text-sm rounded-xl hover:bg-[#243660] transition-colors font-medium"
              >
                <Smartphone size={14} />
                Ativar MFA
              </button>
            </div>
          </div>
          {erro && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {erro}
            </div>
          )}
        </div>
      )}

      {/* Status: Configurando MFA */}
      {status === "enrolling" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Configure seu autenticador</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* QR Code */}
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-3">
                1. Abra seu app de autenticação e escaneie o QR Code:
              </p>
              {qrCode && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={qrCode}
                  alt="QR Code MFA"
                  className="w-48 h-48 mx-auto border border-gray-200 rounded-xl"
                />
              )}
              {secret && (
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-1">Ou digite manualmente:</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg font-mono text-gray-700">
                      {secret}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(secret)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Copiar"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Verificação */}
            <div>
              <p className="text-xs text-gray-500 mb-3">
                2. Digite o código de 6 dígitos gerado pelo app:
              </p>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="input-base text-center text-2xl font-mono tracking-[0.5em] mb-4"
                maxLength={6}
                inputMode="numeric"
                autoFocus
              />
              <button
                onClick={handleVerify}
                disabled={code.length !== 6}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1B2A4A] text-white text-sm rounded-xl hover:bg-[#243660] transition-colors font-medium disabled:opacity-50"
              >
                Verificar e ativar
              </button>
              <button
                onClick={() => { setStatus("disabled"); setQrCode(""); setSecret(""); setCode(""); }}
                className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700 py-2"
              >
                Cancelar
              </button>
            </div>
          </div>

          {erro && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {erro}
            </div>
          )}
        </div>
      )}

      {/* Status: MFA Ativado */}
      {status === "enabled" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={24} className="text-green-500" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900 mb-1">MFA ativado</h2>
              <p className="text-sm text-gray-500 mb-4">
                Sua conta está protegida com autenticação em dois fatores.
                Um código será solicitado a cada novo login.
              </p>
              <button
                onClick={handleDisable}
                disabled={desabilitando}
                className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 text-sm rounded-xl hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
              >
                {desabilitando && <Loader2 size={14} className="animate-spin" />}
                Desativar MFA
              </button>
            </div>
          </div>
          {erro && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {erro}
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-xs text-gray-600">
          <strong>CMN Resolução 2026:</strong> A autenticação em dois fatores (MFA) é obrigatória
          para plataformas fintech a partir de março de 2026. Recomendamos que todos os usuários
          ativem essa proteção.
        </p>
      </div>
    </div>
  );
}
