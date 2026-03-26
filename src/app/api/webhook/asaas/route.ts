import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cliente admin (service role) para atualizar sem RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Mapeamento: plano -> valor do campo plano na tabela empresas
const PLANO_MAP: Record<string, string> = {
  pro:          "pro",
  essencial:    "essencial",
  profissional: "profissional",
};

// -- Helpers
function parseExternalRef(ref: string) {
  const parts = (ref ?? "").split("|");
  if (parts.length < 2) return null;
  return { userId: parts[0], planoSlug: parts[1], ciclo: parts[2] ?? "mensal" };
}

// Grace period: 7 dias apos vencimento antes do corte definitivo
const GRACE_PERIOD_DAYS = 7;

export async function POST(req: NextRequest) {
  try {
    // -- Verificacao de autenticidade do webhook
    const webhookSecret = process.env.ASAAS_WEBHOOK_SECRET;
    if (webhookSecret) {
      const tokenRecebido = req.headers.get("asaas-access-token") ?? "";
      if (tokenRecebido !== webhookSecret) {
        console.warn("Webhook Asaas: token invalido recebido");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const event = await req.json();
    const eventType: string = event.event ?? "";
    const payment = event.payment ?? {};
    const subscription = event.subscription ?? {};

    console.log("Asaas webhook:", eventType, payment?.id ?? subscription?.id);

    // -- PAGAMENTO CONFIRMADO
    if (["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"].includes(eventType)) {
      const ref = parseExternalRef(payment.externalReference);
      if (!ref) {
        console.warn("Webhook sem externalReference valido:", payment.externalReference);
        return NextResponse.json({ ok: true, skipped: true });
      }

      const planoValor = PLANO_MAP[ref.planoSlug];
      if (!planoValor) {
        console.warn("Plano desconhecido no webhook:", ref.planoSlug);
        return NextResponse.json({ ok: true, skipped: true });
      }

      // Calcula data de expiracao do plano
      const agora = new Date();
      const validade = new Date(agora);
      if (ref.ciclo === "anual") {
        validade.setFullYear(validade.getFullYear() + 1);
      } else {
        validade.setMonth(validade.getMonth() + 1);
      }

      const { error } = await supabaseAdmin
        .from("empresas")
        .update({
          plano: planoValor,
          plano_status: "ativo",
          plano_ciclo: ref.ciclo,
          plano_validade: validade.toISOString(),
          plano_pendente: null,
          asaas_last_payment_id: payment.id,
        })
        .eq("user_id", ref.userId);

      if (error) {
        console.error("Erro ao atualizar plano (confirmado):", error);
        return NextResponse.json({ error: "DB error" }, { status: 500 });
      }

      console.log("Plano ATIVADO: user=" + ref.userId + " plano=" + planoValor + " ciclo=" + ref.ciclo);
      return NextResponse.json({ ok: true });
    }

    // -- PAGAMENTO VENCIDO (inadimplencia)
    if (eventType === "PAYMENT_OVERDUE") {
      const ref = parseExternalRef(payment.externalReference);
      if (!ref) return NextResponse.json({ ok: true, skipped: true });

      const { error } = await supabaseAdmin
        .from("empresas")
        .update({ plano_status: "inadimplente" })
        .eq("user_id", ref.userId);

      if (error) {
        console.error("Erro ao marcar inadimplente:", error);
        return NextResponse.json({ error: "DB error" }, { status: 500 });
      }

      console.log("Plano INADIMPLENTE: user=" + ref.userId);
      return NextResponse.json({ ok: true });
    }

    // -- PAGAMENTO ESTORNADO / REMOVIDO
    if (["PAYMENT_REFUNDED", "PAYMENT_DELETED"].includes(eventType)) {
      const ref = parseExternalRef(payment.externalReference);
      if (!ref) return NextResponse.json({ ok: true, skipped: true });

      const { error } = await supabaseAdmin
        .from("empresas")
        .update({
          plano: "starter",
          plano_status: "cancelado",
          plano_ciclo: null,
          plano_validade: null,
          plano_pendente: null,
          asaas_subscription_id: null,
        })
        .eq("user_id", ref.userId);

      if (error) {
        console.error("Erro ao processar estorno:", error);
        return NextResponse.json({ error: "DB error" }, { status: 500 });
      }

      console.log("Plano CANCELADO (estorno/remocao): user=" + ref.userId);
      return NextResponse.json({ ok: true });
    }

    // -- ASSINATURA CANCELADA / REMOVIDA
    if (["SUBSCRIPTION_DELETED", "SUBSCRIPTION_INACTIVE"].includes(eventType)) {
      const subRef = subscription.externalReference ?? payment.externalReference ?? "";
      const ref = parseExternalRef(subRef);

      if (!ref) {
        const subId = subscription.id ?? "";
        if (subId) {
          const { error } = await supabaseAdmin
            .from("empresas")
            .update({
              plano: "starter",
              plano_status: "cancelado",
              plano_ciclo: null,
              plano_validade: null,
              plano_pendente: null,
              asaas_subscription_id: null,
            })
            .eq("asaas_subscription_id", subId);

          if (error) console.error("Erro ao cancelar por subId:", error);
          else console.log("Plano CANCELADO (subscription): subId=" + subId);
        }
        return NextResponse.json({ ok: true });
      }

      const { error } = await supabaseAdmin
        .from("empresas")
        .update({
          plano: "starter",
          plano_status: "cancelado",
          plano_ciclo: null,
          plano_validade: null,
          plano_pendente: null,
          asaas_subscription_id: null,
        })
        .eq("user_id", ref.userId);

      if (error) {
        console.error("Erro ao cancelar assinatura:", error);
        return NextResponse.json({ error: "DB error" }, { status: 500 });
      }

      console.log("Plano CANCELADO (subscription deleted): user=" + ref.userId);
      return NextResponse.json({ ok: true });
    }

    // -- Evento nao tratado
    console.log("Webhook Asaas: evento ignorado:", eventType);
    return NextResponse.json({ ok: true, skipped: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
