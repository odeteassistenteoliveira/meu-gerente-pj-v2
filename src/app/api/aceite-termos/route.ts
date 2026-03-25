import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Route Handler — ignora erros de leitura em Server Components
            }
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "desconhecido";

    const userAgent = request.headers.get("user-agent") || "";
    const versaoTermos = "1.0";

    const { error: insertError } = await supabase
      .from("termos_aceite")
      .insert({
        user_id: user.id,
        versao_termos: versaoTermos,
        ip_address: ip,
        user_agent: userAgent,
      });

    if (insertError) {
      console.error("[aceite-termos] Erro ao inserir:", insertError);
      return NextResponse.json({ error: "Erro ao registrar aceite" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, versao: versaoTermos });
  } catch (err) {
    console.error("[aceite-termos] Erro inesperado:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
