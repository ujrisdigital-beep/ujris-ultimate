import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import DeadlinesClient from "@/components/cases/DeadlinesClient";

export const metadata = { title: "Deadlines Centre" };

export default async function DeadlinesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = (session.user as any).id;

  const deadlines = await db.deadline.findMany({
    where:   { case: { userId }, completed: false },
    orderBy: { dueDate: "asc" },
    include: { case: { select: { id: true, title: true, jurisdiction: true } } },
  });

  return <DeadlinesClient deadlines={JSON.parse(JSON.stringify(deadlines))} />;
}
