import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import DocumentsClient from "@/components/cases/DocumentsClient";

export const metadata = { title: "Evidence Vault" };

export default async function DocumentsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = (session.user as any).id;
  const cas = await db.case.findFirst({
    where:   { id: params.id, userId, deletedAt: null },
    include: { evidence: { where: { deletedAt: null }, orderBy: { uploadedAt: "desc" } } },
  });
  if (!cas) notFound();

  return <DocumentsClient caseData={JSON.parse(JSON.stringify(cas))} />;
}
