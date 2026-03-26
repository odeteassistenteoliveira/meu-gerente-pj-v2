import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// Cliente admin (service role) para atualizar sem RLS
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ASAAS_BASE_URL =
  process.env.ASAAS_SANDBOX === "true"
    ? "https://sandbox.asaas.com/api/v3"
    : "https://api.asaas.com/api/v3";

const ASAAS_API_KEY = process.env.ASAAS_API_KEY ?? "";

export async function POST() {
  try {
    // 1. Autentica o usuario
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    // 2. Busca dados da empresa
    const { data: empresa } = await supabase
      .from("empresas")
      .select("id, plano, asaas_subscription_id")
      .eq("user_id", user.id)
      .single();

    if (!empresa) {
      return NextResponse.json(
        { error: "Empresa nao encontrada" },
        { status: 404 }
      );
    }

    if (empresa.plano === "starter" || !empresa.asaas_subscription_id) {
      return NextResponse.json(
        { error: "Nenhuma assinatura ativa para cancelar" },
        { status: 400 }
      );
    }

    // 3. Cancela a assinatura no Asaas
    if (ASAAS_API_KEY) {
      try {
        const res = await fetch(
          `${ASAAS_BASE_URL}/subscriptions/${empresa.asaas_subscription_id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              access_token: ASAAS_API_KEY,
            },
          }
        );

        // 404 = ja cancelado no Asaas - aceitamos e continuamos
        if (!res.ok && res.status !== 404) {
          const text = await res.text();
          console.error("Asaas cancel error:", res.status, text);
        }
      } catch (asaasErr) {
        console.error("Erro ao chamar Asaas:", asaasErr);
      }
    }

    // 4. Atualiza o banco: volta para starter e limpa dados da assinatura
    const { error: dbError } = await supabaseAdmin
      .from("empresas")
      .update({
        plano: "starter",
        plano_ciclo: null,
        plano_validade: null,
        plano_pendente: null,
        asaas_subscription_id: null,
      })
      .eq("user_id", user.id);

    if (dbError) {
      console.error("DB error on cancel:", dbError);
      return NextResponse.json(
        { error: "Erro ao cancelar no banco de dados" },
        { status: 500 }
      );
    }

    console.log(`Plano cancelado: user=${user.id}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Cancel error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
