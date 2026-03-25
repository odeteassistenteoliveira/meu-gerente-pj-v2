import { getSystemPrompt } from "@/lib/anthropic/prompts";
import type { ModuloIA } from "@/types";

export const runtime = "edge";
export const maxDuration = 60;

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1";

export async function POST(req: Request) {
  try {
    const { messages, modulo, empresa } = (await req.json()) as {
      messages: { role: "user" | "assistant"; content: string }[];
      modulo: ModuloIA;
      empresa?: Record<string, unknown>;
    };

    if (!messages?.length) {
      return Response.json({ error: "Mensagens sao obrigatorias" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[Chat API Error] GEMINI_API_KEY nao configurada");
      return Response.json({ error: "Configuracao invalida do servidor" }, { status: 500 });
    }

    const systemPrompt = getSystemPrompt(modulo || "geral", empresa);

    // Inject system prompt as initial conversation turns
    const systemTurn = systemPrompt
      ? [
          { role: "user" as const, parts: [{ text: systemPrompt }] },
          { role: "model" as const, parts: [{ text: "Entendido. Seguirei essas instrucoes em toda a conversa." }] },
        ]
      : [];

    const geminiContents = [
      ...systemTurn,
      ...messages.map((m) => ({
        role: m.role === "assistant" ? ("model" as const) : ("user" as const),
        parts: [{ text: m.content }],
      })),
    ];

    const requestBody = {
      contents: geminiContents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    };

    const apiUrl = `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:streamGenerateContent?key=${apiKey}&alt=sse`;

    const geminiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!geminiResponse.ok || !geminiResponse.body) {
      const errorText = await geminiResponse.text().catch(() => "unknown error");
      console.error("[Chat API Error] Gemini retornou erro:", geminiResponse.status, errorText);
      return Response.json({ error: "Erro ao chamar a IA" }, { status: 500 });
    }

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const reader = geminiResponse.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const raw = line.slice(6).trim();
              if (!raw || raw === "[DONE]") continue;
              try {
                const parsed = JSON.parse(raw);
                const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
                  );
                }
              } catch {
                // chunk malformado
              }
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          console.error("[Gemini Stream Error]", err);
          const errMsg = JSON.stringify({
            text: "\n\n_Erro ao processar resposta. Tente novamente._",
          });
          controller.enqueue(encoder.encode(`data: ${errMsg}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[Chat API Error]", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
