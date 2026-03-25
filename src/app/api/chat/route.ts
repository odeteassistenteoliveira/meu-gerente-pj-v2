import { getGeminiClient, MODELOS } from "@/lib/anthropic/client";
import { getSystemPrompt } from "@/lib/anthropic/prompts";
import type { ModuloIA } from "@/types";

export const runtime = "edge";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, modulo, empresa } = (await req.json()) as {
      messages: { role: "user" | "assistant"; content: string }[];
      modulo: ModuloIA;
      empresa?: Record<string, unknown>;
    };

    if (!messages?.length) {
      return Response.json(
        { error: "Mensagens são obrigatórias" },
        { status: 400 }
      );
    }

    const genAI = getGeminiClient();
    const systemPrompt = getSystemPrompt(modulo || "geral", empresa);

    const model = genAI.getGenerativeModel({
      model: MODELOS.PRINCIPAL,
      systemInstruction: systemPrompt,
    });

    // Converte mensagens do formato Anthropic para o formato Gemini
    // Anthropic: { role: "user"|"assistant", content: string }
    // Gemini:    { role: "user"|"model",     parts: [{ text: string }] }
    const geminiMessages = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Separa a última mensagem (que será enviada como prompt)
    const history = geminiMessages.slice(0, -1);
    const lastMessage = geminiMessages[geminiMessages.length - 1];

    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(lastMessage.parts);

    // Stream SSE — mesmo formato que o frontend espera
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              const data = JSON.stringify({ text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          console.error("[Gemini Stream Error]", err);
          const errorMsg = JSON.stringify({
            text: "\n\n_Desculpe, ocorreu um erro ao processar. Tente novamente._",
          });
          controller.enqueue(encoder.encode(`data: ${errorMsg}\n\n`));
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
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
