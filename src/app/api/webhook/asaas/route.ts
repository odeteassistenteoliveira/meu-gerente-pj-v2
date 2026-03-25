import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cliente admin (service role) para atualizar sem RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Mapeamento: plano → valor do campo `plano` na tabela empresas
const PLANO_MAP: Record<string, string> = {
  pro:          "pro",
  essencial:    "essencial",
  profissional: "profissional",
};

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();
    const eventType: string = event.event ?? "";
    const payment = event.payment ?? {};

    console.log("Asaas webhook:", eventType, payment?.id);

    // Só processa eventos de pagamento confirmado
    if (!["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"].includes(eventType)) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    // externalReference = "userId|plano|ciclo"
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

    // Calcula data de expiração do plano
    const agora = new Date();
    const validade = new Date(agora);
    if (ciclo === "anual") {
      validade.setFullYear(validade.getFullYear() + 1);
    } else {
      validade.setMonth(validade.getMonth() + 1);
    }

    // Atualiza o plano da empresa
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
