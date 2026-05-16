import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const cas = await db.case.findFirst({
    where:   { id, userId, deletedAt: null },
    include: {
      evidence:   { where: { deletedAt: null }, orderBy: { uploadedAt: "desc" } },
      deadlines:  { where: { completed: false }, orderBy: { dueDate: "asc" } },
      aiSessions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!cas) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(cas);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();

  const cas = await db.case.findFirst({ where: { id, userId, deletedAt: null } });
  if (!cas) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await db.case.update({
    where: { id },
    data:  { ...body, updatedAt: new Date() },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const cas = await db.case.findFirst({ where: { id, userId, deletedAt: null } });
  if (!cas) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.case.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
