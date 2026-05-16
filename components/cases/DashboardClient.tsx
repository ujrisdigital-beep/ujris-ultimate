"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, FolderOpen, Calendar, Bell, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { cn, formatDate, deadlineStatus, daysUntil, CASE_CATEGORIES } from "@/lib/utils";
import { JURISDICTIONS } from "@/lib/utils";
import toast from "react-hot-toast";

interface Props {
  user: { name: string; email: string };
  cases: any[];
  deadlines: any[];
  notifications: any[];
}

const STATUS_COLOR: Record<string, string> = {
  DRAFT:    "tag-gold",
  ACTIVE:   "tag-teal",
  ON_HOLD:  "bg-yellow-500/15 text-yellow-400 tag",
  CLOSED:   "bg-gray-500/15 text-gray-400 tag",
  ARCHIVED: "bg-gray-700/15 text-gray-500 tag",
};

export default function DashboardClient({ user, cases, deadlines, notifications }: Props) {
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Employment", jurisdiction: "GB" });
  const [creating, setCreating] = useState(false);

  const urgent = deadlines.filter(d => ["overdue", "urgent"].includes(deadlineStatus(d.dueDate)));

  async function createCase() {
    setCreating(true);
    try {
      const r = await fetch("/api/cases", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      if (!r.ok) throw new Error();
      const { id } = await r.json();
      toast.success("Case created");
      window.location.href = `/case/${id}`;
    } catch {
      toast.error("Failed to create case");
      setCreating(false);
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user.name.split(" ")[0]}</h1>
          <p className="text-[#7A8FA6] text-sm mt-0.5">{cases.length} active cases · {urgent.length} urgent deadlines</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Case
        </button>
      </div>

      {/* Urgent alerts */}
      {urgent.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-400">Urgent deadlines</p>
            <ul className="mt-1 space-y-0.5">
              {urgent.map(d => (
                <li key={d.id} className="text-sm text-[#EEF2F7]">
                  <span className="text-red-400 font-medium">{d.title}</span> — {d.case?.title} ({daysUntil(d.dueDate) < 0 ? "OVERDUE" : `${daysUntil(d.dueDate)}d left`})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cases list */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-semibold text-[#EEF2F7] mb-3 flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-[#C9A84C]" /> My Cases
          </h2>
          {cases.length === 0 ? (
            <div className="card text-center py-12">
              <Scale className="w-10 h-10 text-[#7A8FA6] mx-auto mb-3" />
              <p className="text-[#7A8FA6]">No cases yet. Start your first case above.</p>
            </div>
          ) : (
            cases.map(c => (
              <Link key={c.id} href={`/case/${c.id}`}
                className="card-hover block group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#EEF2F7] group-hover:text-[#C9A84C] transition-colors truncate">{c.title}</p>
                    <p className="text-xs text-[#7A8FA6] mt-0.5">{c.category} · {JURISDICTIONS.find(j => j.code === c.jurisdiction)?.label ?? c.jurisdiction}</p>
                  </div>
                  <span className={cn(STATUS_COLOR[c.status] ?? "tag")}>{c.status}</span>
                </div>
                <p className="text-xs text-[#7A8FA6] mt-2">{formatDate(c.updatedAt)}</p>
              </Link>
            ))
          )}
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-4">
          {/* Upcoming deadlines */}
          <div className="card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C9A84C]" /> Upcoming Deadlines
            </h3>
            {deadlines.length === 0 ? (
              <p className="text-xs text-[#7A8FA6]">No deadlines set.</p>
            ) : (
              <ul className="space-y-2">
                {deadlines.slice(0, 5).map(d => {
                  const st = deadlineStatus(d.dueDate);
                  return (
                    <li key={d.id} className="flex items-start gap-2">
                      <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0",
                        st === "overdue" ? "bg-red-500" : st === "urgent" ? "bg-orange-400" : st === "soon" ? "bg-yellow-400" : "bg-green-500"
                      )} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#EEF2F7] truncate">{d.title}</p>
                        <p className="text-xs text-[#7A8FA6]">{formatDate(d.dueDate)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <Link href="/deadlines" className="text-xs text-[#C9A84C] hover:underline mt-3 block">View all →</Link>
          </div>

          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#C9A84C]" /> Notifications
              </h3>
              <ul className="space-y-2">
                {notifications.map(n => (
                  <li key={n.id} className="text-xs">
                    <p className="font-medium text-[#EEF2F7]">{n.title}</p>
                    <p className="text-[#7A8FA6]">{n.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick links */}
          <div className="card space-y-2">
            <h3 className="font-semibold mb-2">Quick actions</h3>
            <Link href="/research" className="block text-sm py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">🔍 AI Research</Link>
            <Link href="/?sue=1" className="block text-sm py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">🚀 Sue Wizard</Link>
            <Link href="/citation-graph" className="block text-sm py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">🕸️ Citation Graph</Link>
            <Link href="/marketplace" className="block text-sm py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">🏪 Marketplace</Link>
          </div>
        </div>
      </div>

      {/* New Case Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#152438] rounded-2xl w-full max-w-md border border-white/10">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-lg font-bold">New Case</h2>
              <button onClick={() => setShowNew(false)} className="text-[#7A8FA6] hover:text-white text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[#7A8FA6] mb-1.5">Case title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Unfair dismissal — Acme Corp" className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-[#7A8FA6] mb-1.5">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                  {CASE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#7A8FA6] mb-1.5">Jurisdiction</label>
                <select value={form.jurisdiction} onChange={e => setForm(f => ({ ...f, jurisdiction: e.target.value }))} className="input-field">
                  {JURISDICTIONS.map(j => <option key={j.code} value={j.code}>{j.label}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowNew(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={createCase} disabled={!form.title || creating} className="btn-primary flex-1">
                  {creating ? "Creating…" : "Create case"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Local Scale icon to avoid circular import
function Scale({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 16h6" /><path d="M2 16h6" /><path d="M12 2v20" /><path d="m5.5 10 3 6 3-6" /><path d="m12.5 10 3 6 3-6" /><path d="M3 2h18" />
    </svg>
  );
}
