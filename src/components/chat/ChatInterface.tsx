"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, RotateCcw, Copy, Check, Sparkles } from "lucide-react";
import type { ModuloIA } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface Mensagem {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  modulo: ModuloIA;
  placeholderInicial?: string;
  sugestoesIniciais?: string[];
  corDestaque?: string;
}

export default function ChatInterface({
  modulo,
  placeholderInicial = "Pergunte qualquer coisa...",
  sugestoesIniciais = [],
  corDestaque = "bg-[#1B2A4A]",
}: ChatInterfaceProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [input, setInput] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [sessaoId, setSessaoId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function loadEmpresa() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("empresas")
          .select("id")
          .eq("user_id", user.id)
          .single();
        if (data) setEmpresaId(data.id);
      } catch {
        // silently fail — history saving is optional
      }
    }
    loadEmpresa();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens]);

  const salvarMensagens = useCallback(async (
    sessao: string | null,
    userMsg: Mensagem,
    assistantMsg: Mensagem,
    currentEmpresaId: string | null,
    currentModulo: ModuloIA,
  ): Promise<string | null> => {
    if (!currentEmpresaId) return sessao;
    try {
      const supabase = createClient();
      let sid = sessao;
      if (!sid) {
        const { data } = await supabase
          .from("sessoes_chat")
          .insert({
            empresa_id: currentEmpresaId,
            modulo: currentModulo,
            titulo: userMsg.content.slice(0, 80),
          })
          .select("id")
          .single();
        if (data) sid = data.id as string;
      }
      if (sid) {
        await supabase.from("mensagens").insert([
          { sessao_id: sid, role: "user", content: userMsg.content },
          { sessao_id: sid, role: "assistant", content: assistantMsg.content },
        ]);
      }
      return sid;
    } catch {
      return sessao;
    }
  }, []);

  const enviar = useCallback(async (texto: string) => {
    if (!texto.trim() || carregando) return;

    const novaMensagemUser: Mensagem = {
      id: crypto.randomUUID(),
      role: "user",
      content: texto.trim(),
    };

    const historico = [...mensagens, novaMensagemUser];
    setMensagens(historico);
    setInput("");
    setCarregando(true);

    const idAssistant = crypto.randomUUID();
    setMensagens((prev) => [
      ...prev,
      { id: idAssistant, role: "assistant", content: "" },
    ]);

    let respostaFinal = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historico.map((m) => ({ role: m.role, content: m.content })),
          modulo,
        }),
      });

      if (!res.ok) throw new Error("Erro na API");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let acumulado = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const linhas = chunk.split("\n");
        for (const linha of linhas) {
          if (linha.startsWith("data: ")) {
            const dado = linha.slice(6).trim();
            if (dado === "[DONE]") break;
            try {
              const parsed = JSON.parse(dado);
              if (parsed.text) {
                acumulado += parsed.text;
                setMensagens((prev) =>
                  prev.map((m) =>
                    m.id === idAssistant ? { ...m, content: acumulado } : m
                  )
                );
              }
            } catch {
              // chunk parcial — ignora
            }
          }
        }
      }
      respostaFinal = acumulado;
    } catch {
      respostaFinal = "Desculpe, ocorreu um erro ao processar sua pergunta. Verifique a chave da API e tente novamente.";
      setMensagens((prev) =>
        prev.map((m) =>
          m.id === idAssistant ? { ...m, content: respostaFinal } : m
        )
      );
    } finally {
      setCarregando(false);
      inputRef.current?.focus();
      if (respostaFinal) {
        const assistantMsg: Mensagem = { id: idAssistant, role: "assistant", content: respostaFinal };
        salvarMensagens(sessaoId, novaMensagemUser, assistantMsg, empresaId, modulo).then((newSessaoId) => {
          if (newSessaoId && !sessaoId) setSessaoId(newSessaoId);
        });
      }
    }
  }, [mensagens, carregando, modulo, empresaId, sessaoId, salvarMensagens]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar(input);
    }
  }

  async function copiarTexto(texto: string, id: string) {
    await navigator.clipboard.writeText(texto);
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  }

  function limparConversa() {
    setMensagens([]);
    setInput("");
    setSessaoId(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll flex flex-col">
        {mensagens.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 md:px-8 py-10 fade-in-up">
            <div className="w-14 h-14 bg-[#1B2A4A] rounded-2xl flex items-center justify-center mb-4 shadow-md">
              <Sparkles size={24} className="text-blue-300" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">Como posso ajudar?</h3>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
              Faça sua pergunta em português — da forma mais natural possível.
            </p>
            {sugestoesIniciais.length > 0 && (
              <div className="mt-6 flex flex-col gap-2.5 w-full max-w-md px-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Perguntas frequentes</p>
                {sugestoesIniciais.map((s, i) => (
                  <button key={i} onClick={() => enviar(s)} className="suggestion-chip text-left">
                    <span className="text-gray-400 mr-2 font-mono text-[11px]">↗</span>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {mensagens.length > 0 && (
          <div className="flex flex-col gap-5 px-4 md:px-8 py-6">
            {mensagens.map((msg) => (
              <div key={msg.id} className={`flex gap-3 items-start ${msg.role === "user" ? "justify-end msg-user" : "justify-start msg-assistant"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-xl bg-[#1B2A4A] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Sparkles size={13} className="text-blue-300" />
                  </div>
                )}
                <div className={`group max-w-[86%] md:max-w-[72%] text-sm leading-relaxed relative ${
                  msg.role === "user"
                    ? "bg-[#1B2A4A] text-white rounded-2xl rounded-tr-sm px-4 py-3"
                    : "bg-white border border-gray-100 shadow-sm text-gray-800 rounded-2xl rounded-tl-sm px-4 py-3.5"
                }`}>
                  {msg.role === "assistant" && msg.content === "" ? (
                    <div className="flex items-center gap-1.5 py-1 px-0.5">
                      <div className="w-2 h-2 bg-gray-300 rounded-full typing-dot" />
                      <div className="w-2 h-2 bg-gray-300 rounded-full typing-dot" />
                      <div className="w-2 h-2 bg-gray-300 rounded-full typing-dot" />
                    </div>
                  ) : (
                    <MensagemConteudo texto={msg.content} isUser={msg.role === "user"} />
                  )}
                  {msg.role === "assistant" && msg.content && (
                    <button
                      onClick={() => copiarTexto(msg.content, msg.id)}
                      className="absolute -bottom-6 right-0 opacity-0 group-hover:opacity-100 transition-all duration-150 flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 bg-white border border-gray-200 rounded-full px-2 py-0.5 shadow-sm"
                    >
                      {copiado === msg.id ? (
                        <><Check size={11} className="text-green-500" /> Copiado</>
                      ) : (
                        <><Copy size={11} /> Copiar</>
                      )}
                    </button>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">Eu</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 bg-white px-4 md:px-6 py-4 shadow-[0_-1px_8px_rgba(0,0,0,0.04)]">
        {mensagens.length > 0 && (
          <div className="flex justify-end mb-2.5">
            <button
              onClick={limparConversa}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full px-3 py-1"
            >
              <RotateCcw size={11} />
              Nova conversa
            </button>
          </div>
        )}
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholderInicial}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all duration-200 max-h-32 overflow-y-auto placeholder:text-gray-400"
            style={{ minHeight: "46px" }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 128) + "px";
            }}
          />
          <button
            onClick={() => enviar(input)}
            disabled={!input.trim() || carregando}
            className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
              input.trim() && !carregando
                ? `${corDestaque} text-white hover:opacity-90 shadow-md active:scale-95`
                : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            {carregando ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mt-2 text-center">
          <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono">Enter</kbd> para enviar
          &nbsp;·&nbsp;
          <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono">Shift+Enter</kbd> para quebrar linha
        </p>
      </div>
    </div>
  );
}

function MensagemConteudo({ texto, isUser }: { texto: string; isUser: boolean }) {
  if (isUser) return <p className="whitespace-pre-wrap">{texto}</p>;
  const linhas = texto.split("\n");
  return (
    <div className="space-y-1.5">
      {linhas.map((linha, i) => {
        if (linha.startsWith("---")) return <hr key={i} className="border-gray-100 my-2" />;
        if (linha.startsWith("|")) return (
          <code key={i} className="block font-mono text-xs bg-gray-50 border border-gray-200 rounded px-2 py-0.5 overflow-x-auto">{linha}</code>
        );
        if (linha.startsWith("## ")) return <p key={i} className="font-bold text-[15px] text-gray-900 mt-3 mb-1">{formatarInline(linha.slice(3))}</p>;
        if (linha.startsWith("### ")) return <p key={i} className="font-semibold text-[13px] text-gray-800 mt-2">{formatarInline(linha.slice(4))}</p>;
        const matchNum = linha.match(/^(\d+)\.\s(.+)/);
        if (matchNum) return (
          <div key={i} className="flex gap-2.5 pl-1">
            <span className="text-gray-400 font-semibold text-xs mt-0.5 w-4 flex-shrink-0">{matchNum[1]}.</span>
            <p className="text-sm leading-relaxed">{formatarInline(matchNum[2])}</p>
          </div>
        );
        if (linha.startsWith("- ") || linha.startsWith("* ")) return (
          <div key={i} className="flex gap-2.5 pl-1">
            <span className="text-gray-400 mt-1.5 flex-shrink-0">•</span>
            <p className="text-sm leading-relaxed">{formatarInline(linha.slice(2))}</p>
          </div>
        );
        if (linha.trim() === "") return <div key={i} className="h-1" />;
        return <p key={i} className="text-sm leading-relaxed">{formatarInline(linha)}</p>;
      })}
    </div>
  );
}

function formatarInline(texto: string): React.ReactNode {
  const partes = texto.split(/(\*\*.*?\*\*|`.*?`)/g);
  return partes.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i} className="font-semibold text-gray-900">{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`")) return <code key={i} className="bg-gray-100 text-gray-800 rounded px-1 py-0.5 text-[12px] font-mono">{p.slice(1, -1)}</code>;
    return p;
  });
}
