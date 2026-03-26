import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLANO_MAP: Record<string, string> = {
  pro:          "pro",
  essencial:    "essencial",
  profissional: "profissional",
};

export async function POST(req: NextRequest) {
  try {
    // Verifica autenticidade do webhook via header asaas-access-token
    const webhookSecret = process.env.ASAAS_WEBHOOK_SECRET;
    if (webhookSecret) {
      const tokenRecebido = req.headers.get("asaas-access-token") ?? "";
      if (tokenRecebido !== webhookSecret) {
        console.warn("Webhook Asaas: token inválido recebido");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const event = await req.json();
    const eventType: string = event.event ?? "";
    const payment = event.payment ?? {};

    console.log("Asaas webhook:", eventType, payment?.id);

    if (!["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"].includes(eventType)) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const ref: string = payment.externalReference ?? "";
    const parts = ref.split("|");
    if (parts.length < 2) {
      console.warn("Webhook sem externalReference válido:", ref);
      return NextResponse.json({ ok: true, skipped: true });
    }

    const [userId, planoSlug, ciclo] = parts;
    const planoValor = PLANO_MAP[planoSlug];

    if (!planoValor) {
      console.warn("Plano desconhecido no webhook:", planoSlug);
      return NextResponse.json({ ok: true, skipped: true });
    }

    const agora = new Date();
    const validade = new Date(agora);
    if (ciclo === "anual") {
      validade.setFullYear(validade.getFullYear() + 1);
    } else {
      validade.setMonth(validade.getMonth() + 1);
    }

    const { error } = await supabaseAdmin
      .from("empresas")
      .update({
        plano: planoValor,
        plano_ciclo: ciclo ?? "mensal",
        plano_validade: validade.toISOString(),
        plano_pendente: null,
        asaas_last_payment_id: payment.id,
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Erro ao atualizar plano:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    console.log(`Plano atualizado: user=${userId} plano=${planoValor} ciclo=${ciclo}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
