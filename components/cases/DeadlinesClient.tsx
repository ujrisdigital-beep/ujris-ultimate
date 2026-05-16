"use client";
import { useState } from "react";
import Link from "next/link";
import { Calendar, Plus, CheckCircle } from "lucide-react";
import { formatDate, deadlineStatus, daysUntil } from "@/lib/utils";
import toast from "react-hot-toast";

interface Deadline {
  id: string; title: string; dueDate: string; completed: boolean;
  case: { id: string; title: string; jurisdiction: string };
}

export default function DeadlinesClient({ deadlines }: { deadlines: Deadline[] }) {
  const [items, setItems]   = useState(deadlines);
  const [filter, setFilter] = useState<"all" | "urgent" | "soon" | "ok">("all");

  async function markDone(id: string) {
    try {
      await fetch(`/api/deadlines/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed: true }) });
      setItems(items.filter(d => d.id !== id));
      toast.success("Marked complete");
    } catch { toast.error("Failed"); }
  }

  const filtered = filter === "all" ? items : items.filter(d => deadlineStatus(d.dueDate) === filter);
  const overdue  = items.filter(d => deadlineStatus(d.dueDate) === "overdue").length;
  const urgent   = items.filter(d => deadlineStatus(d.dueDate) === "urgent").length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#C9A84C]" /> Deadlines Centre
        </h1>
        {overdue > 0 && (
          <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-sm text-red-400">
            ⚠️ {overdue} overdue deadline{overdue > 1 ? "s" : ""} — take action immediately
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "urgent", "soon", "ok"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? "bg-[#C9A84C] text-[#0D1B2A]" : "bg-white/5 text-[#7A8FA6] hover:bg-white/10"}`}
          >
            {f === "all" ? `All (${items.length})` : f === "urgent" ? `Urgent (${urgent})` : f === "soon" ? "Soon" : "OK"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="w-10 h-10 text-[#7A8FA6] mx-auto mb-3" />
          <p className="text-[#7A8FA6]">No deadlines in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(d => {
            const st = deadlineStatus(d.dueDate);
            const days = daysUntil(d.dueDate);
            return (
              <div key={d.id} className="card flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${st === "overdue" ? "bg-red-500" : st === "urgent" ? "bg-orange-400" : st === "soon" ? "bg-yellow-400" : "bg-green-500"}`} />
                    <p className="font-semibold text-[#EEF2F7] truncate">{d.title}</p>
                  </div>
                  <p className="text-xs text-[#7A8FA6] mt-1 ml-4.5">
                    <Link href={`/case/${d.case.id}`} className="hover:text-[#C9A84C]">{d.case.title}</Link>
                    {" · "}{formatDate(d.dueDate)}
                    {" · "}<span className={st === "overdue" ? "text-red-400 font-medium" : st === "urgent" ? "text-orange-400 font-medium" : ""}>{st === "overdue" ? "OVERDUE" : `${days}d left`}</span>
                  </p>
                </div>
                <button onClick={() => markDone(d.id)}
                  className="shrink-0 p-2 text-[#7A8FA6] hover:text-green-400 transition-colors" title="Mark complete">
                  <CheckCircle className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
