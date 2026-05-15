import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { TokenPermission, TokenType } from "@prisma/client";
import { writeAudit } from "@/lib/audit";

const TOKEN_EXPIRY_DAYS = 7;

export function generateSecureToken(): string {
  return randomBytes(32).toString("hex");
}

// ─── Generate an agency invite token ──────────────────────────────────────

export async function generateAgencyToken(
  caseId: string,
  generatedBy: string,
  agencyId: string,
  permission: TokenPermission = TokenPermission.READ_ONLY
) {
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const record = await db.caseAccessToken.create({
    data: { caseId, generatedBy, agencyId, type: TokenType.AGENCY_INVITE, permission, token, expiresAt, isActive: true },
  });

  await writeAudit({
    action: "TOKEN_GENERATED",
    actorId: generatedBy,
    caseId,
    resourceId: record.id,
    resourceType: "CaseAccessToken",
    details: { agencyId, permission, expiresAt },
  });

  return record;
}

// ─── Accept an agency invite token ────────────────────────────────────────

export async function acceptAgencyToken(token: string, acceptedBy: string) {
  const record = await db.caseAccessToken.findUnique({ where: { token } });

  if (!record) throw new Error("TOKEN_NOT_FOUND");
  if (!record.isActive) throw new Error("TOKEN_INACTIVE");
  if (record.acceptedAt) throw new Error("TOKEN_ALREADY_USED");
  if (record.revokedAt) throw new Error("TOKEN_REVOKED");
  if (record.expiresAt < new Date()) throw new Error("TOKEN_EXPIRED");

  const updated = await db.caseAccessToken.update({
    where: { id: record.id },
    data: { acceptedAt: new Date(), acceptedBy },
  });

  await writeAudit({
    action: "TOKEN_ACCEPTED",
    actorId: acceptedBy,
    caseId: record.caseId,
    agencyId: record.agencyId ?? undefined,
    resourceId: record.id,
    resourceType: "CaseAccessToken",
  });

  return updated;
}

// ─── Revoke an agency token ────────────────────────────────────────────────

export async function revokeAgencyToken(tokenId: string, revokedBy: string) {
  const record = await db.caseAccessToken.findUnique({ where: { id: tokenId } });
  if (!record) throw new Error("TOKEN_NOT_FOUND");

  const updated = await db.caseAccessToken.update({
    where: { id: tokenId },
    data: { isActive: false, revokedAt: new Date(), revokedBy },
  });

  await writeAudit({
    action: "TOKEN_REVOKED",
    actorId: revokedBy,
    caseId: record.caseId,
    agencyId: record.agencyId ?? undefined,
    resourceId: tokenId,
    resourceType: "CaseAccessToken",
  });

  return updated;
}

// ─── Validate an agency token (used in API middleware) ────────────────────

export async function validateAgencyToken(token: string) {
  const record = await db.caseAccessToken.findUnique({
    where: { token },
    include: { agency: true, case: true },
  });

  if (!record) return { valid: false, reason: "TOKEN_NOT_FOUND" };
  if (!record.isActive) return { valid: false, reason: "TOKEN_INACTIVE" };
  if (record.revokedAt) return { valid: false, reason: "TOKEN_REVOKED" };
  if (record.expiresAt < new Date()) {
    await db.caseAccessToken.update({ where: { id: record.id }, data: { isActive: false } });
    await writeAudit({ action: "TOKEN_EXPIRED", caseId: record.caseId, resourceId: record.id, resourceType: "CaseAccessToken" });
    return { valid: false, reason: "TOKEN_EXPIRED" };
  }

  return { valid: true, record };
}

// ─── Generate a 7-day court order access token ────────────────────────────

export async function generateCourtOrderToken(
  caseId: string,
  courtOrderId: string,
  generatedBy: string
) {
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const record = await db.caseAccessToken.create({
    data: {
      caseId,
      generatedBy,
      type: TokenType.COURT_ORDER_ACCESS,
      permission: TokenPermission.READ_ONLY,
      token,
      expiresAt,
      isActive: true,
      courtOrderId,
    },
  });

  await writeAudit({
    action: "COURT_ORDER_ACCESS_GRANTED",
    actorId: generatedBy,
    caseId,
    resourceId: courtOrderId,
    resourceType: "CourtOrderRequest",
    details: { tokenId: record.id, expiresAt },
  });

  return record;
}
