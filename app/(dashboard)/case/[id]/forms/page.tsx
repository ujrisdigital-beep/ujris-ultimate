import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import FormBuilderClient from "@/components/forms/FormBuilderClient";

export const metadata = { title: "Court Form Builder" };

export default async function FormsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = (session.user as any).id;
  const cas = await db.case.findFirst({
    where:  { id: params.id, userId, deletedAt: null },
    select: { id: true, title: true, jurisdiction: true, category: true },
  });
  if (!cas) notFound();

  return <FormBuilderClient caseData={JSON.parse(JSON.stringify(cas))} />;
}
