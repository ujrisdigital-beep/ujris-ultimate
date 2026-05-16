import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const VALID_CATEGORIES = ["EMPLOYMENT","HOUSING","BENEFITS","FAMILY","IMMIGRATION","CRIMINAL","CIVIL","CONSUMER","OTHER"] as const;

const CreateSchema = z.object({
  title:        z.string().min(1).max(200),
  category:     z.enum(VALID_CATEGORIES).default("OTHER"),
  jurisdiction: z.string().min(2).max(10),
  description:  z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const cases = await db.case.findMany({
    where:   { userId, deletedAt: null, ...(status ? { status: status as any } : {}) },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { evidence: true, deadlines: { where: { completed: false } } } },
    },
  });

  return NextResponse.json(cases);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { title, category, jurisdiction, description } = parsed.data;

  const newCase = await db.case.create({
    data: { title, category, jurisdiction, description, userId, status: "ACTIVE" },
  });

  await db.auditLog.create({
    data: { action: "CASE_CREATED", actorId: userId, caseId: newCase.id, resourceId: newCase.id, resourceType: "case" },
  }).catch(() => null);

  return NextResponse.json(newCase, { status: 201 });
}
