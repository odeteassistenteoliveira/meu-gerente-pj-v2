import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh da sessão — importante para SSR
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Rotas protegidas: redireciona para login se não autenticado
  const rotasProtegidas = ["/dashboard", "/calculadora", "/taxas", "/credito", "/bancario", "/investimentos"];
  const rotasExcludas = ["/login", "/cadastro", "/completar-perfil", "/upgrade", "/perfil"];
  const estaEmRotaProtegida = rotasProtegidas.some((r) => pathname.startsWith(r));

  if (estaEmRotaProtegida && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Se já logado e tentando acessar login/cadastro, redireciona para dashboard
  if ((pathname === "/login" || pathname === "/cadastro") && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  // Verificar perfil completo para rotas protegidas
  if (user && estaEmRotaProtegida && !pathname.startsWith("/completar-perfil")) {
    const { data: empresa } = await supabase
      .from("empresas")
      .select("perfil_completo")
      .eq("user_id", user.id)
      .single();

    if (empresa && empresa.perfil_completo === false) {
      const completarPerfilUrl = request.nextUrl.clone();
      completarPerfilUrl.pathname = "/completar-perfil";
      return NextResponse.redirect(completarPerfilUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|public/).*)",
  ],
};
