import { createHash } from "crypto";
import { db } from "@/lib/db";
import { AuditAction, Prisma } from "@prisma/client";

// ─── Blockchain-style SHA-256 hash chain ───────────────────────────────────
// Each entry includes the hash of the previous entry, making tampering detectable.

function computeEntryHash(entry: {
  sequenceNo: number;
  action: string;
  actorId?: string | null;
  caseId?: string | null;
  details?: unknown;
  createdAt: Date;
  prevHash: string;
}): string {
  const payload = JSON.stringify({
    seq: entry.sequenceNo,
    action: entry.action,
    actorId: entry.actorId ?? null,
    caseId: entry.caseId ?? null,
    details: entry.details ?? null,
    createdAt: entry.createdAt.toISOString(),
    prevHash: entry.prevHash,
  });
  return createHash("sha256").update(payload).digest("hex");
}

async function getLastHash(): Promise<string> {
  const last = await db.auditLog.findFirst({ orderBy: { sequenceNo: "desc" } });
  // Genesis hash for first entry
  return last?.entryHash ?? createHash("sha256").update("UJRIS_GENESIS_BLOCK_v4").digest("hex");
}

export interface AuditEntry {
  action: AuditAction;
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  agencyId?: string;
  caseId?: string;
  resourceId?: string;
  resourceType?: string;
  details?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

export async function writeAudit(entry: AuditEntry): Promise<void> {
  const prevHash = await getLastHash();
  const createdAt = new Date();

  // We compute seq optimistically; in high-concurrency use a DB sequence
  const count = await db.auditLog.count();
  const sequenceNo = count + 1;

  const entryHash = computeEntryHash({
    sequenceNo,
    action: entry.action,
    actorId: entry.actorId,
    caseId: entry.caseId,
    details: entry.details,
    createdAt,
    prevHash,
  });

  await db.auditLog.create({
    data: {
      sequenceNo,
      action: entry.action,
      actorId: entry.actorId,
      actorEmail: entry.actorEmail,
      actorRole: entry.actorRole,
      agencyId: entry.agencyId,
      caseId: entry.caseId,
      resourceId: entry.resourceId,
      resourceType: entry.resourceType,
      details: entry.details,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      prevHash,
      entryHash,
      createdAt,
    },
  });
}

// Verify the integrity of the audit chain (can be run as a cron or admin check)
export async function verifyAuditChain(): Promise<{ valid: boolean; brokenAt?: number }> {
  const logs = await db.auditLog.findMany({ orderBy: { sequenceNo: "asc" } });
  const genesis = createHash("sha256").update("UJRIS_GENESIS_BLOCK_v4").digest("hex");

  let prevHash = genesis;
  for (const log of logs) {
    if (log.prevHash !== prevHash) {
      return { valid: false, brokenAt: log.sequenceNo };
    }
    const expected = computeEntryHash({
      sequenceNo: log.sequenceNo,
      action: log.action,
      actorId: log.actorId,
      caseId: log.caseId,
      details: log.details,
      createdAt: log.createdAt,
      prevHash: log.prevHash,
    });
    if (expected !== log.entryHash) {
      return { valid: false, brokenAt: log.sequenceNo };
    }
    prevHash = log.entryHash;
  }
  return { valid: true };
}
