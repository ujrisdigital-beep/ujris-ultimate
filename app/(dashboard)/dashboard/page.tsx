import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import DashboardClient from "@/components/cases/DashboardClient";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = (session.user as any).id;

  const [cases, deadlines, notifications] = await Promise.all([
    db.case.findMany({
      where:   { userId, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take:    20,
    }),
    db.deadline.findMany({
      where:   { case: { userId }, completed: false },
      orderBy: { dueDate: "asc" },
      take:    10,
      include: { case: { select: { title: true } } },
    }),
    db.notification.findMany({
      where:   { userId, read: false },
      orderBy: { createdAt: "desc" },
      take:    5,
    }),
  ]);

  return (
    <DashboardClient
      user={{ name: session.user?.name ?? "User", email: session.user?.email ?? "" }}
      cases={JSON.parse(JSON.stringify(cases))}
      deadlines={JSON.parse(JSON.stringify(deadlines))}
      notifications={JSON.parse(JSON.stringify(notifications))}
    />
  );
}
