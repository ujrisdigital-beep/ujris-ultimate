import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { supabaseAdmin, BUCKET } from "@/lib/supabase";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const ev = await db.evidence.findFirst({
    where: { id: params.id, case: { userId }, deletedAt: null },
  });
  if (!ev) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (ev.storageKey) {
    await supabaseAdmin.storage.from(BUCKET).remove([ev.storageKey]).catch(() => null);
  }

  await db.evidence.update({ where: { id: params.id }, data: { deletedAt: new Date() } });

  await db.auditLog.create({
    data: { action: "EVIDENCE_DELETED", actorId: userId, resourceId: ev.id, resourceType: "evidence" },
  }).catch(() => null);

  return NextResponse.json({ success: true });
}
