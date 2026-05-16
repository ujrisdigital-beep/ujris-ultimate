"use client";
import { useState } from "react";
import Link from "next/link";
import { Calendar, Plus, CheckCircle, Trash2, ChevronLeft } from "lucide-react";
import { formatDate, deadlineStatus, daysUntil } from "@/lib/utils";
import toast from "react-hot-toast";

interface Deadline {
  id: string; title: string; dueDate: string; completed: boolean;
}

interface Props {
  caseId: string; caseTitle: string; deadlines: Deadline[];
}

export default function CaseDeadlinesClient({ caseId, caseTitle, deadlines }: Props) {
  const [items, setItems]     = useState(deadlines);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate]   = useState("");
  const [adding, setAdding]     = useState(false);

  async function addDeadline() {
    if (!newTitle.trim() || !newDate) return;
    setAdding(true);
    try {
      const res = await fetch("/api/deadlines", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ caseId, title: newTitle, dueDate: newDate }),
      });
      if (!res.ok) throw new Error("Failed");
      const d = await res.json();
      setItems(prev => [...prev, d].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
      setNewTitle(""); setNewDate("");
      toast.success("Deadline added");
    } catch { toast.error("Failed to add deadline"); }
    finally  { setAdding(false); }
  }

  async function markDone(id: string) {
    await fetch(`/api/deadlines/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed: true }) });
    setItems(prev => prev.filter(d => d.id !== id));
    toast.success("Marked complete");
  }

  async function remove(id: string) {
    await fetch(`/api/deadlines/${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(d => d.id !== id));
    toast.success("Deleted");
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/case/${caseId}`} className="flex items-center gap-1 text-sm text-[#7A8FA6] hover:text-[#C9A84C] mb-3">
          <ChevronLeft className="w-4 h-4" /> Back to case
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#C9A84C]" /> Deadlines
        </h1>
        <p className="text-[#7A8FA6] text-sm mt-1">{caseTitle}</p>
      </div>

      {/* Add deadline */}
      <div className="card mb-8">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Deadline</h2>
        <div className="flex gap-3">
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
            placeholder="Deadline title e.g. Submit ET1 form"
            className="input-field flex-1" />
          <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
            className="input-field w-44" />
          <button onClick={addDeadline} disabled={adding || !newTitle || !newDate}
            className="btn-primary shrink-0">Add</button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="card text-center py-10">
            <Calendar className="w-8 h-8 text-[#7A8FA6] mx-auto mb-3" />
            <p className="text-[#7A8FA6]">No deadlines set.</p>
          </div>
        )}
        {items.map(d => {
          const st = deadlineStatus(d.dueDate);
          const days = daysUntil(d.dueDate);
          return (
            <div key={d.id} className="card flex items-center gap-4">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${st === "overdue" ? "bg-red-500" : st === "urgent" ? "bg-orange-400" : st === "soon" ? "bg-yellow-400" : "bg-green-500"}`} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#EEF2F7]">{d.title}</p>
                <p className="text-xs text-[#7A8FA6]">
                  {formatDate(d.dueDate)} ·{" "}
                  <span className={st === "overdue" ? "text-red-400 font-medium" : st === "urgent" ? "text-orange-400 font-medium" : ""}>
                    {st === "overdue" ? "OVERDUE" : `${days}d left`}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => markDone(d.id)} className="p-2 text-[#7A8FA6] hover:text-green-400 transition-colors" title="Mark done">
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button onClick={() => remove(d.id)} className="p-2 text-[#7A8FA6] hover:text-red-400 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
