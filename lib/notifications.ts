import { db } from "@/lib/db";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function createNotification(
  userId: string,
  title: string,
  body: string,
  type: string,
  link?: string
) {
  return db.notification.create({ data: { userId, title, body, type, link } });
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.EMAIL_SERVER_HOST) return; // skip in dev if not configured
  await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
}

export async function notifyCourtOrderAccess(userId: string, orderRef: string, caseTitle: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const title = "⚠️ Court-Ordered Access Granted to Your Case";
  const body = `A court order (ref: ${orderRef}) has granted 7-day read-only access to your case "${caseTitle}". All access will be fully logged. If you believe this is incorrect, contact legal@ujris.org immediately.`;

  await createNotification(userId, title, body, "COURT_ORDER_ACCESS", "/dashboard");

  if (user.email) {
    await sendEmail(user.email, title, `<p>${body}</p><p>You can view your full audit log in the UJRIS platform.</p>`);
  }
}

export async function notifyAgencyInviteAccepted(ownerId: string, agencyName: string, caseTitle: string) {
  await createNotification(
    ownerId,
    `${agencyName} has joined your case`,
    `${agencyName} has accepted your invitation and now has access to "${caseTitle}". You can monitor all their actions in the audit log.`,
    "AGENCY_JOINED",
    "/dashboard/cases"
  );
}

export async function notifyTokenRevoked(agencyUserId: string, caseTitle: string) {
  await createNotification(
    agencyUserId,
    "Case access revoked",
    `Your access to the case "${caseTitle}" has been revoked by the case owner.`,
    "ACCESS_REVOKED"
  );
}
