import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

// ─── Check if a user can access a case (row-level security) ───────────────

export async function canAccessCase(
  userId: string,
  caseId: string,
  userRole: UserRole
): Promise<{ allowed: boolean; permission?: "read" | "write" }> {
  // Platform admin: full access
  if (userRole === UserRole.PLATFORM_ADMIN) return { allowed: true, permission: "write" };

  // Case owner: full access
  const caseRecord = await db.case.findUnique({ where: { id: caseId }, select: { userId: true, deletedAt: true } });
  if (!caseRecord || caseRecord.deletedAt) return { allowed: false };
  if (caseRecord.userId === userId) return { allowed: true, permission: "write" };

  // Agency member: check for active accepted token
  if (userRole === UserRole.AGENCY_MEMBER || userRole === UserRole.AGENCY_ADMIN) {
    const membership = await db.agencyMember.findUnique({ where: { userId }, include: { agency: true } });
    if (!membership) return { allowed: false };

    const token = await db.caseAccessToken.findFirst({
      where: {
        caseId,
        agencyId: membership.agencyId,
        isActive: true,
        acceptedAt: { not: null },
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!token) return { allowed: false };
    return { allowed: true, permission: token.permission === "READ_WRITE" ? "write" : "read" };
  }

  return { allowed: false };
}

export async function assertCaseAccess(
  userId: string,
  caseId: string,
  userRole: UserRole,
  requiredPermission: "read" | "write" = "read"
): Promise<void> {
  const { allowed, permission } = await canAccessCase(userId, caseId, userRole);
  if (!allowed) throw new Error("FORBIDDEN");
  if (requiredPermission === "write" && permission !== "write") throw new Error("READ_ONLY");
}

export async function isCaseOwner(userId: string, caseId: string): Promise<boolean> {
  const c = await db.case.findUnique({ where: { id: caseId }, select: { userId: true } });
  return c?.userId === userId;
}

export async function isPlatformAdmin(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  return user?.role === UserRole.PLATFORM_ADMIN;
}
