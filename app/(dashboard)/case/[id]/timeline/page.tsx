import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import TimelineClient from "@/components/cases/TimelineClient";

export const metadata = { title: "Case Timeline" };

export default async function TimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = (session.user as any).id;
  const cas = await db.case.findFirst({
    where:  { id, userId, deletedAt: null },
    select: { id: true, title: true, jurisdiction: true, description: true },
  });
  if (!cas) notFound();

  return <TimelineClient caseData={JSON.parse(JSON.stringify(cas))} />;
}
