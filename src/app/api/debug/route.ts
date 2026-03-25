export const runtime = "edge";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return Response.json({ error: "no key" }, { status: 500 });

  try {
    // List all available models
    const [r1, r2] = await Promise.all([
      fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`),
      fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`),
    ]);
    const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
    const v1Models = (d1.models || []).map((m: { name: string }) => m.name);
    const v1betaModels = (d2.models || []).map((m: { name: string }) => m.name);
    return Response.json({ v1: v1Models, v1beta: v1betaModels });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
