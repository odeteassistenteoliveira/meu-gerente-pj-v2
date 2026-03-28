"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Sparkles } from "lucide-react";

export default function CompletarPerfilPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [erro, setErro] = useState("");

  // Estados do formulário
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [cpfSocio, setCpfSocio] = useState("");

  // Funções de formatação
  function formatarCNPJ(v: string) {
    const n = v.replace(/\D/g, "").slice(0, 14);
    return n
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  function formatarCPF(v: string) {
    const n = v.replace(/\D/g, "").slice(0, 11);
    return n
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }

  // Carregar dados existentes
  useEffect(() => {
    async function loadData() {
      setCarregandoDados(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: empresa } = await supabase
        .from("empresas")
        .select("nome_fantasia, cnpj, cpf_socio")
        .eq("user_id", user.id)
        .single();

      if (empresa) {
        setNomeFantasia(empresa.nome_fantasia || "");
        setCnpj(empresa.cnpj ? formatarCNPJ(empresa.cnpj) : "");
        setCpfSocio(empresa.cpf_socio ? formatarCPF(empresa.cpf_socio) : "");
      }

      setCarregandoDados(false);
    }

    loadData();
  }, [router]);

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    // Validação
    if (!nomeFantasia.trim()) {
      setErro("Nome da empresa é obrigatório.");
      setCarregando(false);
      return;
    }

    const cnpjLimpo = cnpj.replace(/\D/g, "");
    const cpfLimpo = cpfSocio.replace(/\D/g, "");

    if (!cnpjLimpo && !cpfLimpo) {
      setErro("Informe o CNPJ da empresa ou CPF do sócio para continuar.");
      setCarregando(false);
      return;
    }

    // Atualizar no banco
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setErro("Sessão expirada. Faça login novamente.");
      setCarregando(false);
      return;
    }

    const { error } = await supabase
      .from("empresas")
      .update({
        nome_fantasia: nomeFantasia,
        cnpj: cnpjLimpo || null,
        cpf_socio: cpfLimpo || null,
      })
      .eq("user_id", user.id);

    if (error) {
      setErro("Erro ao salvar perfil. Tente novamente.");
      setCarregando(false);
      return;
    }

    setCarregando(false);
    router.push("/dashboard");
  }

  if (carregandoDados) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo e título */}
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-pj.svg" alt="Meu Gerente PJ" className="w-14 h-14 object-contain mx-auto mb-3 drop-shadow-xl" />
          <h1 className="text-lg font-bold text-gray-900">Meu Gerente PJ</h1>
          <h2 className="text-[15px] font-bold text-gray-900 mt-6 mb-2">Complete seu perfil</h2>
          <p className="text-sm text-gray-500">Para usar o Meu Gerente PJ, precisamos de algumas informações da sua empresa.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-8 border border-gray-100">
          <form onSubmit={handleSalvar} className="space-y-4">
            {/* Nome fantasia */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                Nome da empresa *
              </label>
              <input
                type="text"
                value={nomeFantasia}
                onChange={(e) => setNomeFantasia(e.target.value)}
                required
                placeholder="Nome fantasia ou razão social"
                className="input-base"
              />
            </div>

            {/* Seção CNPJ / CPF */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">
                Identificação *
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Informe CNPJ ou CPF do sócio — um dos dois é obrigatório para emissão de cobranças.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(formatarCNPJ(e.target.value))}
                    placeholder="00.000.000/0001-00"
                    className="input-base"
                    inputMode="numeric"
                    maxLength={18}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                    CPF do sócio
                  </label>
                  <input
                    type="text"
                    value={cpfSocio}
                    onChange={(e) => setCpfSocio(formatarCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    className="input-base"
                    inputMode="numeric"
                    maxLength={14}
                  />
                </div>
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {erro}
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={carregando || !nomeFantasia.trim()}
              className="w-full btn-primary py-3 rounded-xl text-[14px] flex items-center justify-center gap-2 mt-6"
            >
              {carregando && <Loader2 size={15} className="animate-spin" />}
              {carregando ? "Salvando..." : "Salvar e continuar"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Gerente com 20+ anos de experiência · CEA & CFP · Dados protegidos pela LGPD
        </p>
      </div>
    </div>
  );
    }
