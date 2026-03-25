import { getSystemPrompt } from "@/lib/anthropic/prompts";
import type { ModuloIA } from "@/types";

export const runtime = "edge";
export const maxDuration = 60;

const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1";

export async function POST(req: Request) {
  try {
    const { messages, modulo, empresa } = (await req.json()) as {
      messages: { role: "user" | "assistant"; content: string }[];
      modulo: ModuloIA;
      empresa?: Record<string, unknown>;
    };
    if (!messages?.length) {
      return Response.json({ error: "Mensagens obrigatorias" }, { status: 400 });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[Chat API Error] GEMINI_API_KEY nao configurada");
      return Response.json({ error: "Configuracao invalida" }, { status: 500 });
    }
    const systemPrompt = getSystemPrompt(modulo || "geral", empresa);
    const geminiContents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const body = JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: geminiContents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    });
    const url = GEMINI_API_BASE + "/models/" + GEMINI_MODEL + ":streamGenerateContent?key=" + apiKey + "&alt=sse";
    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    if (!geminiRes.ok || !geminiRes.body) {
      const errText = await geminiRes.text().catch(() => "unknown");
      console.error("[Chat API Error] Gemini:", geminiRes.status, errText);
      return Response.json({ error: "Erro ao chamar IA" }, { status: 500 });
    }
    const stream = new ReadableStream({
      async start(ctrl) {
        const enc = new TextEncoder();
        const reader = geminiRes.body!.getReader();
        const dec = new TextDecoder();
        let buf = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            const lines = buf.split("\n");
            buf = lines.pop() || "";
            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const raw = line.slice(6).trim();
              if (!raw || raw === "[DONE]") continue;
