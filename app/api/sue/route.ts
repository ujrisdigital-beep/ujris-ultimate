import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { generateFormContent } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { claimType, jurisdiction, facts } = await req.json();
  if (!claimType || !facts) return NextResponse.json({ error: "claimType and facts required" }, { status: 400 });

  try {
    const document = await generateFormContent(claimType, jurisdiction ?? "GB", facts);
    return NextResponse.json({ document });
  } catch (err: any) {
    console.error("Sue wizard error:", err);
    return NextResponse.json({ error: err.message ?? "Document generation failed" }, { status: 500 });
  }
}
