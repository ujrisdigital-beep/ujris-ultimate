import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();

  const deadline = await db.deadline.findFirst({
    where: { id, case: { userId } },
  });
  if (!deadline) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await db.deadline.update({
    where: { id },
    data:  { completed: body.completed ?? deadline.completed },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const deadline = await db.deadline.findFirst({
    where: { id, case: { userId } },
  });
  if (!deadline) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.deadline.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
