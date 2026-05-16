import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import CaseWorkspace from "@/components/cases/CaseWorkspace";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await db.case.findUnique({ where: { id }, select: { title: true } });
  return { title: c?.title ?? "Case" };
}

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = (session.user as any).id;
  const cas = await db.case.findFirst({
    where:   { id, userId, deletedAt: null },
    include: {
      evidence:   { where: { deletedAt: null }, orderBy: { uploadedAt: "desc" } },
      messages:   { orderBy: { sentAt: "asc" }, take: 100 },
      aiSessions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!cas) notFound();

  const deadlines = await db.deadline.findMany({
    where:   { caseId: id },
    orderBy: { dueDate: "asc" },
  });

  return (
    <CaseWorkspace
      caseData={JSON.parse(JSON.stringify(cas))}
      deadlines={JSON.parse(JSON.stringify(deadlines))}
      userId={userId}
    />
  );
}
