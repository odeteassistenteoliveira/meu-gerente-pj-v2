import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Após o login OAuth, redireciona para o dashboard
  // O middleware cuida de redirecionar para completar-perfil se necessário
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Usa a URL de produção para evitar redirecionamentos incorretos
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin;
      return NextResponse.redirect(`${appUrl}${next}`);
    }
  }

  // Em caso de erro, redireciona para o login com mensagem
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin;
  return NextResponse.redirect(`${appUrl}/login?erro=oauth`);
}
