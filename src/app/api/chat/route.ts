import { getAnthropicClient, MODELOS } from "@/lib/anthropic/client";
import { getSystemPrompt } from "@/lib/anthropic/prompts";
import type { ModuloIA } from "@/types";

export const maxDuration = 10;

export async function POST(req: Request) {
  try {
    const { messages, modulo, empresa } = await req.json() as {
      messages: { role: "user" | "assistant"; content: string }[];
      modulo: ModuloIA;
      empresa?: Record<string, unknown>;
    };

    if (!messages?.length) {
      return Response.json({ error: "Mensagens são obrigatórias" }, { status: 400 });
    }

    const client = getAnthropicClient();
    const systemPrompt = getSystemPrompt(modulo || "geral", empresa);

    // Stream de resposta para melhor UX
    const stream = await client.messages.stream({
      model: MODELOS.SONNET,
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    // Converte para ReadableStream compatível com Next.js
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              const data = JSON.stringify({ text: chunk.delta.text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.error(err);
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
