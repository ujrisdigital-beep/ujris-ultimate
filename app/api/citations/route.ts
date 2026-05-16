import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { anthropic, UJRIS_SYSTEM } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { query, jurisdiction, caseContext } = await req.json();
  if (!query) return NextResponse.json({ error: "query required" }, { status: 400 });

  const system = `${UJRIS_SYSTEM}

You are building a citation network graph. Return ONLY valid JSON with this structure:
{
  "nodes": [
    { "id": "string", "label": "short name", "title": "full citation", "type": "landmark|recent|related", "year": "number", "court": "string", "summary": "one sentence" }
  ],
  "edges": [
    { "from": "id", "to": "id", "label": "relationship type" }
  ]
}

Include 8-15 nodes. Types: "landmark" (seminal cases), "recent" (last 5 years), "related" (adjacent cases). Connect cases that cite each other or establish/apply principles. Jurisdiction: ${jurisdiction ?? "GB"}.`;

  const contextLine = caseContext ? `\nCase context: ${caseContext}` : "";

  const msg = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 4096,
    system,
    messages: [{ role: "user", content: `Build citation network for: ${query}${contextLine}` }],
  });

  try {
    const text = (msg.content[0] as { text: string }).text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON");
    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ nodes: [], edges: [] });
  }
}
