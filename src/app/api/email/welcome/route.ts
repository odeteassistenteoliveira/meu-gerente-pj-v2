import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIP, rateLimitHeaders, RATE_LIMITS } from "@/lib/security";
import { emailWelcomeSchema, formatZodError } from "@/lib/security/validators";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "Meu Gerente PJ <contato@meugerentepj.com.br>";

function buildWelcomeHtml(nomeEmpresa: string) {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bem-vindo ao Meu Gerente PJ</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f3f4f6; }
    .wrapper { max-width: 580px; margin: 0 auto; padding: 40px 16px; }
    .card { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: #1B2A4A; padding: 36px 40px; text-align: center; }
    .logo { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #60a5fa, #3b82f6); border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 13px; }
    .logo-text { color: white; font-size: 18px; font-weight: 700; }
    .tagline { color: #93c5fd; font-size: 13px; margin-top: 4px; }
    .body { padding: 40px; }
    .greeting { font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 12px; }
    .text { font-size: 15px; color: #6b7280; line-height: 1.7; margin-bottom: 20px; }
    .highlight { color: #1B2A4A; font-weight: 600; }
    .modules { background: #f9fafb; border-radius: 14px; padding: 24px; margin: 28px 0; }
    .modules-title { font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px; }
    .module { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
    .module:last-child { margin-bottom: 0; }
    .module-dot { width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
    .module-text { font-size: 14px; color: #374151; }
    .module-text strong { font-weight: 600; color: #111827; }
    .cta { text-align: center; margin: 32px 0 24px; }
    .btn { display: inline-block; background: #1B2A4A; color: white; text-decoration: none; padding: 14px 36px; border-radius: 12px; font-weight: 600; font-size: 15px; }
    .footer { text-align: center; padding: 24px 40px; border-top: 1px solid #f3f4f6; }
    .footer-text { font-size: 12px; color: #9ca3af; line-height: 1.6; }
    .signature { margin-top: 28px; padding-top: 24px; border-top: 1px solid #f3f4f6; }
    .sig-name { font-weight: 700; color: #111827; font-size: 14px; }
    .sig-role { font-size: 13px; color: #6b7280; margin-top: 2px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="logo">
          <div class="logo-icon">GP</div>
          <span class="logo-text">Meu Gerente PJ</span>
        </div>
        <p class="tagline">Consultor Financeiro com Inteligência Artificial</p>
      </div>

      <div class="body">
        <h1 class="greeting">Bem-vindo, <span class="highlight">${nomeEmpresa || "empreendedor"}</span>! 👋</h1>

        <p class="text">
          Sua conta está ativa e o seu gerente financeiro já está pronto para trabalhar com você.
          Agora você tem acesso a um especialista com mais de 20 anos de mercado — disponível a qualquer hora.
        </p>

        <div class="modules">
          <p class="modules-title">O que você pode fazer agora</p>
          <div class="module">
            <div class="module-dot"></div>
            <p class="module-text"><strong>Calculadora Financeira</strong> — juros compostos, ponto de equilíbrio e capital de giro com respostas em segundos</p>
          </div>
          <div class="module">
            <div class="module-dot"></div>
            <p class="module-text"><strong>Simulador de Crédito</strong> — compare BNDES, Pronampe e capital de giro com o CET real de cada linha</p>
          </div>
          <div class="module">
            <div class="module-dot"></div>
            <p class="module-text"><strong>Taxas & Tarifas</strong> — descubra se está pagando caro na maquininha, conta PJ ou Pix</p>
          </div>
          <div class="module">
            <div class="module-dot"></div>
            <p class="module-text"><strong>Especialista Bancário</strong> — regras de TED, boleto, Pix e câmbio explicadas com clareza</p>
          </div>
          <div class="module">
            <div class="module-dot"></div>
            <p class="module-text"><strong>Investimentos PJ</strong> — CDB, Tesouro, LCI e LCA com rendimento líquido já descontado o IR</p>
          </div>
        </div>

        <p class="text">
          Dica: fale de forma natural, como faria com um consultor de confiança. Mencione valores reais e o que precisa decidir — quanto mais contexto, melhor a resposta.
        </p>

        <div class="cta">
          <a href="https://app.meugerentepj.com.br/dashboard" class="btn">Acessar meu painel →</a>
        </div>

        <div class="signature">
          <p class="sig-name">Renan — Fundador, Meu Gerente PJ</p>
          <p class="sig-role">CEA · CFP · MBA em Finanças Empresariais · +20 anos de mercado</p>
        </div>
      </div>

      <div class="footer">
        <p class="footer-text">
          Você está recebendo este e-mail porque criou uma conta no Meu Gerente PJ.<br />
          © ${new Date().getFullYear()} Meu Gerente PJ · Todos os direitos reservados.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(req);
    const rl = checkRateLimit(`email-welcome:${ip}`, RATE_LIMITS.email);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Muitas requisições. Tente novamente em instantes." },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    if (!RESEND_API_KEY) {
      console.warn("[email/welcome] RESEND_API_KEY não configurada — email não enviado");
      return NextResponse.json({ ok: true, skipped: true });
    }

    const body = await req.json();

    // Zod validation
    const parsed = emailWelcomeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { email, nomeEmpresa } = parsed.data;

    const html = buildWelcomeHtml(nomeEmpresa || "");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: `Bem-vindo ao Meu Gerente PJ, ${nomeEmpresa || "empreendedor"}! 🎉`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[email/welcome] Resend error:", err);
      return NextResponse.json({ error: "Falha ao enviar email" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ ok: true, id: data.id });
  } catch (err) {
    console.error("[email/welcome] Erro:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
