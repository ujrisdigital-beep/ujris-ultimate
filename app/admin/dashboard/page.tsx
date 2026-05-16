import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Users, FileText, AlertTriangle, Activity } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as any).role !== "ADMIN") redirect("/dashboard");

  const [users, cases, evidence, recentLogs] = await Promise.all([
    db.user.count(),
    db.case.count({ where: { deletedAt: null } }),
    db.evidence.count({ where: { deletedAt: null } }),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 20, include: { actor: { select: { name: true, email: true } } } }),
  ]);

  const overdueDeadlines = await db.deadline.count({
    where: { completed: false, dueDate: { lt: new Date() } },
  });

  const urgentDeadlines = await db.deadline.count({
    where: {
      completed: false,
      dueDate: {
        gte: new Date(),
        lt:  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  const alarmLevel = overdueDeadlines > 10 ? 3 : overdueDeadlines > 3 ? 2 : overdueDeadlines > 0 ? 1 : 0;
  const alarmColors = ["bg-green-500/10 border-green-500/30 text-green-400", "bg-yellow-500/10 border-yellow-500/30 text-yellow-400", "bg-orange-500/10 border-orange-500/30 text-orange-400", "bg-red-500/10 border-red-500/30 text-red-400"];
  const alarmLabels = ["All systems normal", "⚠️ Level 1 — Monitor", "🔶 Level 2 — Action required", "🔴 Level 3 — Critical"];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-[#7A8FA6] text-sm mt-1">Platform overview · Audit log · Alarm centre</p>
      </div>

      {/* Alarm banner */}
      <div className={`border rounded-xl px-5 py-4 mb-8 ${alarmColors[alarmLevel]}`}>
        <p className="font-semibold">{alarmLabels[alarmLevel]}</p>
        {overdueDeadlines > 0 && (
          <p className="text-sm mt-1">{overdueDeadlines} overdue deadline{overdueDeadlines > 1 ? "s" : ""} · {urgentDeadlines} due within 7 days</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total users",      value: users,    icon: <Users className="w-5 h-5" />,         color: "text-blue-400" },
          { label: "Active cases",     value: cases,    icon: <FileText className="w-5 h-5" />,       color: "text-[#C9A84C]" },
          { label: "Evidence files",   value: evidence, icon: <Activity className="w-5 h-5" />,       color: "text-teal-400" },
          { label: "Overdue deadlines",value: overdueDeadlines, icon: <AlertTriangle className="w-5 h-5" />, color: "text-red-400" },
        ].map(s => (
          <div key={s.label} className="card">
            <div className={`${s.color} mb-2`}>{s.icon}</div>
            <p className="text-2xl font-bold text-[#EEF2F7]">{s.value}</p>
            <p className="text-xs text-[#7A8FA6] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Audit log */}
      <div className="card">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#C9A84C]" /> Recent Audit Log
        </h2>
        <div className="space-y-2">
          {recentLogs.length === 0 && <p className="text-[#7A8FA6] text-sm">No activity yet.</p>}
          {recentLogs.map(log => (
            <div key={log.id} className="flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-0">
              <div className="min-w-0">
                <p className="text-sm text-[#EEF2F7]">
                  <span className="text-[#C9A84C]">{log.actor?.name ?? log.actor?.email ?? "Unknown"}</span>
                  {" "}<span className="text-[#7A8FA6]">{log.action}</span>
                  {log.resourceId && <span className="text-xs text-[#7A8FA6] ml-1">· {log.resourceId.slice(0, 8)}</span>}
                </p>
              </div>
              <span className="text-xs text-[#7A8FA6] shrink-0">{formatDate(log.createdAt.toISOString())}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
