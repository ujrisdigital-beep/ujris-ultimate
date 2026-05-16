import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { generateLegalResearch } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { query, jurisdiction } = await req.json();
  if (!query) return NextResponse.json({ error: "query required" }, { status: 400 });

  try {
    const result = await generateLegalResearch(query, jurisdiction ?? "GB");
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Research route error:", err);
    return NextResponse.json({ error: err.message ?? "Research failed" }, { status: 500 });
  }
}
