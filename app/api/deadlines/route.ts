import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const CreateSchema = z.object({
  caseId:  z.string(),
  title:   z.string().min(1).max(200),
  dueDate: z.string(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const caseId = searchParams.get("caseId");

  const deadlines = await db.deadline.findMany({
    where: {
      case: { userId },
      ...(caseId ? { caseId } : {}),
      completed: false,
    },
    orderBy: { dueDate: "asc" },
    include: { case: { select: { id: true, title: true, jurisdiction: true } } },
  });

  return NextResponse.json(deadlines);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const cas = await db.case.findFirst({ where: { id: parsed.data.caseId, userId } });
  if (!cas) return NextResponse.json({ error: "Case not found" }, { status: 404 });

  const deadline = await db.deadline.create({
    data: {
      caseId:    parsed.data.caseId,
      title:     parsed.data.title,
      dueDate:   new Date(parsed.data.dueDate),
      completed: false,
    },
  });

  return NextResponse.json(deadline, { status: 201 });
}
