import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import CaseDeadlinesClient from "@/components/cases/CaseDeadlinesClient";

export const metadata = { title: "Case Deadlines" };

export default async function CaseDeadlinesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = (session.user as any).id;
  const cas = await db.case.findFirst({
    where:   { id, userId, deletedAt: null },
    select:  { id: true, title: true },
  });
  if (!cas) notFound();

  const deadlines = await db.deadline.findMany({
    where:   { caseId: id },
    orderBy: { dueDate: "asc" },
  });

  return (
    <CaseDeadlinesClient
      caseId={cas.id}
      caseTitle={cas.title}
      deadlines={JSON.parse(JSON.stringify(deadlines))}
    />
  );
}
