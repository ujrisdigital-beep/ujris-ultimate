import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { anthropic, UJRIS_SYSTEM, detectContradictions } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { caseId, jurisdiction, messages, context, task } = await req.json();

  try {
    if (task === "contradictions") {
      const lines = context ? context.split("\n").filter(Boolean) : [];
      const reply = await detectContradictions(lines);
      return NextResponse.json({ reply });
    }

    const systemPrompt = context
      ? `${UJRIS_SYSTEM}\n\nJURISDICTION: ${jurisdiction ?? "GB"}\n\nCASE CONTEXT:\n${context}`
      : `${UJRIS_SYSTEM}\n\nJURISDICTION: ${jurisdiction ?? "GB"}`;

    const msg = await anthropic.messages.create({
      model:      "claude-opus-4-5",
      max_tokens: 4096,
      system:     systemPrompt,
      messages:   (messages ?? []).map((m: { role: string; content: string }) => ({
        role:    m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const reply = (msg.content[0] as { text: string }).text;

    if (caseId) {
      await db.aISession.create({
        data: {
          caseId,
          userId,
          jurisdiction: jurisdiction ?? "GB",
          messages:     messages ?? [],
          confidenceScore: null,
        },
      }).catch(() => null);
    }

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("AI route error:", err);
    return NextResponse.json({ error: err.message ?? "AI request failed" }, { status: 500 });
  }
}
