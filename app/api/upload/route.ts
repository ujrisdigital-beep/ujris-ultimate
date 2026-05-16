import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { supabaseAdmin, BUCKET } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const formData = await req.formData();

  const file     = formData.get("file") as File | null;
  const caseId   = formData.get("caseId") as string | null;
  const chunk    = formData.get("chunk") as string | null;
  const total    = formData.get("total") as string | null;
  const uploadId = formData.get("uploadId") as string | null;

  if (!file || !caseId) return NextResponse.json({ error: "file and caseId required" }, { status: 400 });

  const cas = await db.case.findFirst({ where: { id: caseId, userId, deletedAt: null } });
  if (!cas) return NextResponse.json({ error: "Case not found" }, { status: 404 });

  const chunkIdx    = chunk ? parseInt(chunk) : 0;
  const totalChunks = total ? parseInt(total) : 1;
  const uid         = uploadId ?? `${userId}-${Date.now()}`;

  const buf   = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);

  const chunkPath = totalChunks > 1
    ? `evidence/${caseId}/${uid}/chunk_${chunkIdx}`
    : `evidence/${caseId}/${uid}/${file.name}`;

  const { error: uploadError } = await supabaseAdmin.storage.from(BUCKET).upload(chunkPath, bytes, {
    upsert:      true,
    contentType: file.type || "application/octet-stream",
  });

  if (uploadError) {
    console.error("Supabase upload error:", uploadError);
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  if (chunkIdx < totalChunks - 1) {
    return NextResponse.json({ status: "chunk_received", chunk: chunkIdx });
  }

  const { data: urlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(chunkPath);

  // Simple hex hash from first 1KB for dedup
  const hashBuf  = await crypto.subtle.digest("SHA-256", bytes.slice(0, 1024));
  const hashHex  = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, "0")).join("");

  const evidence = await db.evidence.create({
    data: {
      caseId,
      uploadedBy:   userId,
      fileName:     file.name,
      originalName: file.name,
      mimeType:     file.type,
      fileSize:     file.size,
      storageKey:   chunkPath,
      sha256Hash:   hashHex,
      type:         guessType(file.name) as any,
    },
  });

  await db.auditLog.create({
    data: {
      action:       "EVIDENCE_UPLOADED",
      actorId:      userId,
      caseId,
      resourceId:   evidence.id,
      resourceType: "evidence",
    },
  }).catch(() => null);

  return NextResponse.json({ evidence, url: urlData.publicUrl }, { status: 201 });
}

function guessType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["pdf", "doc", "docx", "txt", "rtf"].includes(ext)) return "DOCUMENT";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))  return "IMAGE";
  if (["mp3", "wav", "ogg", "m4a", "flac"].includes(ext))          return "AUDIO";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext))          return "VIDEO";
  if (["eml", "msg"].includes(ext))                                 return "EMAIL";
  return "OTHER";
}
