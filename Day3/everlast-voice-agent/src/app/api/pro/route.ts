import { NextResponse } from "next/server";

type OllamaChatResponse = {
  message?: { content?: string };
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const userText = String((body as any)?.userText ?? "").trim();

    if (!userText) {
      return NextResponse.json({
        ok: true,
        reply: "Pro Mode ist aktiv (Local LLM). Sag oder tippe etwas.",
      });
    }

    const res = await fetch("http://127.0.0.1:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.1:8b",
        stream: false,
        messages: [{ role: "user", content: userText }],
      }),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return NextResponse.json(
        { ok: false, error: `Ollama Fehler: HTTP ${res.status} ${t}` },
        { status: 500 }
      );
    }

    const data = (await res.json().catch(() => ({}))) as OllamaChatResponse;
    const reply = String(data?.message?.content ?? "").trim() || "Keine Antwort erhalten.";

    return NextResponse.json({ ok: true, reply });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "unknown error" },
      { status: 500 }
    );
  }
}
