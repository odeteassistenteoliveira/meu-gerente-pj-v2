import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) return NextResponse.json({ ok: false });

    const today = new Date().toISOString().slice(0, 10);

    // Deduplica por session_id dentro do mesmo dia
    const { data: existing } = await supabase
      .from("page_views")
      .select("id")
      .eq("session_id", sessionId)
      .gte("created_at", `${today}T00:00:00Z`)
      .maybeSingle();

    if (!existing) {
      await supabase.from("page_views").insert({ session_id: sessionId, page: "landing" });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
