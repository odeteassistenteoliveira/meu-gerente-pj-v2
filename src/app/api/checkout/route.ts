import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ASAAS_BASE_URL = process.env.ASAAS_SANDBOX === "true"
  ? "https://sandbox.asaas.com/api/v3"
  : "https://api.asaas.com/api/v3";

const ASAAS_API_KEY = process.env.ASAAS_API_KEY ?? "";

const PLANOS: Record<string, { nome: string; mensal: number; anual: number }> = {
  pro:           { nome: "Pro",          mensal:  97,  anual:  970 },
  essencial:     { nome: "Essencial",    mensal: 197,  anual: 1970 },
  profissional:  { nome: "Profissional", mensal: 497,  anual: 4970 },
};

async function asaasRequest(path: string, method: string, body?: object) {
  const res = await fetch(`${ASAAS_BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", "access_token": ASAAS_API_KEY },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!text.trim()) return { errors: [{ description: `HTTP ${res.status} — resposta vazia.` }] };
  try { return JSON.parse(text); }
  catch { return { errors: [{ description: `HTTP ${res.status} — resposta inválida: ${text.slice(0, 300)}` }] }; }
}

export async function POST(req: NextRequest) {
  try {
    if (!ASAAS_API_KEY) return NextResponse.json({ error: "Pagamentos não configurados." }, { status: 503 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { plano, ciclo } = await req.json() as { plano: string; ciclo: "mensal" | "anual" };
    if (!PLANOS[plano]) return NextResponse.json({ error: "Plano inválido" }, { status: 400 });

    const { data: empresa } = await supabase
      .from("empresas")
      .select("id, nome_fantasia, cnpj, cpf_socio, asaas_customer_id")
      .eq("user_id", user.id)
      .single();

    // CPF/CNPJ obrigatorio no Asaas para criar assinatura
    const cpfCnpj = (empresa?.cnpj ?? empresa?.cpf_socio ?? "").replace(/\D/g, "");
    if (!cpfCnpj) {
      return NextResponse.json(
        { error: "CPF ou CNPJ obrigatorio para assinar. Acesse 'Minha Empresa' e preencha seu CPF ou CNPJ." },
        { status: 400 }
      );
    }

    let customerId = empresa?.asaas_customer_id as string | null;

    if (!customerId) {
      const customer = await asaasRequest("/customers", "POST", {
        name: empresa?.nome_fantasia ?? user.email ?? "Cliente",
        email: user.email ?? "",
        cpfCnpj,
      });
      if (customer.errors || !customer.id) {
        console.error("Asaas customer error:", customer);
        return NextResponse.json({ error: "Erro ao criar cliente no gateway", detail: customer.errors }, { status: 502 });
      }
      customerId = customer.id as string;
      await supabase.from("empresas").update({ asaas_customer_id: customerId }).eq("id", empresa?.id);
    }

    const planoInfo = PLANOS[plano];
    const valor = ciclo === "anual" ? planoInfo.anual : planoInfo.mensal;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const subscription = await asaasRequest("/subscriptions", "POST", {
      customer: customerId,
      billingType: "UNDEFINED",
      cycle: ciclo === "anual" ? "YEARLY" : "MONTHLY",
      value: valor,
      nextDueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      description: `Meu Gerente PJ - Plano ${planoInfo.nome} (${ciclo})`,
      externalReference: `${user.id}|${plano}|${ciclo}`,
      redirectUrl: `${appUrl}/dashboard?upgrade=success`,
    });

    if (subscription.errors || !subscription.id) {
      console.error("Asaas subscription error:", subscription);
      return NextResponse.json({ error: "Erro ao criar assinatura", detail: subscription.errors }, { status: 502 });
    }

    await supabase.from("empresas").update({
      asaas_subscription_id: subscription.id,
      plano_pendente: plano,
      plano_ciclo: ciclo,
    }).eq("id", empresa?.id);

    const payments = await asaasRequest(`/subscriptions/${subscription.id}/payments`, "GET");
    const firstPayment = payments?.data?.[0];
    const asaasWebBase = process.env.ASAAS_SANDBOX === "true" ? "https://sandbox.asaas.com" : "https://www.asaas.com";
    const paymentUrl = firstPayment?.invoiceUrl ?? firstPayment?.bankSlipUrl
      ?? (firstPayment?.id ? `${asaasWebBase}/c/${firstPayment.id}` : null);

    if (!paymentUrl) {
      console.error("Asaas: sem link de pagamento", payments);
      return NextResponse.json({ error: "Link de pagamento nao disponivel. Tente novamente." }, { status: 502 });
    }

    return NextResponse.json({ paymentUrl, subscriptionId: subscription.id });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
                                                                                                          }
