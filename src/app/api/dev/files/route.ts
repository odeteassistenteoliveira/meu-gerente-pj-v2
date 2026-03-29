import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { checkRateLimit, getClientIP, rateLimitHeaders, RATE_LIMITS } from "@/lib/security";

// Rota temporária apenas para desenvolvimento — exporta arquivos para deploy
export async function GET(req: NextRequest) {
  // Rate limiting
  const ip = getClientIP(req);
  const rl = checkRateLimit(`dev-files:${ip}`, RATE_LIMITS.admin);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em instantes." },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const root = process.cwd();
  const ignore = new Set([
    "node_modules", ".next", ".git", ".env.local",
    "tsconfig.tsbuildinfo", "next-env.d.ts", "next.config.js"
  ]);

  function walk(dir: string): Record<string, string> {
    const result: Record<string, string> = {};
    for (const entry of fs.readdirSync(dir)) {
      if (ignore.has(entry)) continue;
      const full = path.join(dir, entry);
      const rel = path.relative(root, full);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        Object.assign(result, walk(full));
      } else {
        try {
          const content = fs.readFileSync(full);
          result[rel] = content.toString("base64");
        } catch {}
      }
    }
    return result;
  }

  const files = walk(root);
  return NextResponse.json({ files, count: Object.keys(files).length });
}
