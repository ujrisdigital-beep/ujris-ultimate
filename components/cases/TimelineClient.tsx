"use client";
import { useState } from "react";
import Link from "next/link";
import { Clock, Plus, Trash2, Search, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";

interface Event {
  id: string; date: string; time: string; description: string; source: string;
}

interface Props {
  caseData: { id: string; title: string; jurisdiction: string; description: string | null };
}

export default function TimelineClient({ caseData }: Props) {
  const [events, setEvents]     = useState<Event[]>([]);
  const [date, setDate]         = useState("");
  const [time, setTime]         = useState("");
  const [desc, setDesc]         = useState("");
  const [source, setSource]     = useState("");
  const [analysing, setAnalysing] = useState(false);
  const [analysis, setAnalysis]   = useState("");

  function addEvent() {
    if (!date || !desc) return;
    setEvents(prev => [...prev, { id: Math.random().toString(36).slice(2), date, time, description: desc, source }]
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)));
    setDate(""); setTime(""); setDesc(""); setSource("");
  }

  function removeEvent(id: string) {
    setEvents(prev => prev.filter(e => e.id !== id));
  }

  async function analyseContradictions() {
    if (events.length < 2) return toast.error("Add at least 2 events first");
    setAnalysing(true);
    setAnalysis("");
    try {
      const lines = events.map(e => `${e.date}${e.time ? " " + e.time : ""}: ${e.description}${e.source ? " [Source: " + e.source + "]" : ""}`);
      const res = await fetch("/api/ai", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          task: "contradictions",
          caseId: caseData.id,
          jurisdiction: caseData.jurisdiction,
          messages: [],
          context: lines.join("\n"),
        }),
      });
      const data = await res.json();
      setAnalysis(data.reply);
    } catch { toast.error("Analysis failed"); }
    finally   { setAnalysing(false); }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={`/case/${caseData.id}`} className="flex items-center gap-1 text-sm text-[#7A8FA6] hover:text-[#C9A84C] mb-3">
          <ChevronLeft className="w-4 h-4" /> Back to case
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="w-6 h-6 text-[#C9A84C]" /> Case Timeline
        </h1>
        <p className="text-[#7A8FA6] text-sm mt-1">{caseData.title}</p>
      </div>

      {/* Add event */}
      <div className="card mb-8">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Event</h2>
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field" />
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className="input-field" placeholder="Time (optional)" />
        </div>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
          placeholder="Describe what happened…"
          className="input-field w-full mb-3 resize-none" />
        <div className="flex gap-3">
          <input value={source} onChange={e => setSource(e.target.value)}
            placeholder="Source (email, witness, document…)"
            className="input-field flex-1" />
          <button onClick={addEvent} disabled={!date || !desc} className="btn-primary shrink-0">Add event</button>
        </div>
      </div>

      {/* Timeline */}
      {events.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">{events.length} events</h2>
            <button onClick={analyseContradictions} disabled={analysing}
              className="btn-secondary text-sm flex items-center gap-2">
              <Search className="w-4 h-4" />
              {analysing ? "Analysing…" : "Detect contradictions"}
            </button>
          </div>
          <div className="relative pl-6 border-l-2 border-white/10 space-y-6 mb-8">
            {events.map(ev => (
              <div key={ev.id} className="relative">
                <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-[#C9A84C]" />
                <div className="card ml-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-[#C9A84C] font-medium mb-1">{ev.date}{ev.time ? " · " + ev.time : ""}</p>
                      <p className="text-sm text-[#EEF2F7]">{ev.description}</p>
                      {ev.source && <p className="text-xs text-[#7A8FA6] mt-1">Source: {ev.source}</p>}
                    </div>
                    <button onClick={() => removeEvent(ev.id)}
                      className="shrink-0 p-1 text-[#7A8FA6] hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {analysis && (
            <div className="card border border-[#C9A84C]/30">
              <h3 className="font-semibold mb-3 text-[#C9A84C]">🔍 Contradiction Analysis</h3>
              <p className="text-sm text-[#EEF2F7] whitespace-pre-wrap leading-relaxed">{analysis}</p>
            </div>
          )}
        </>
      )}

      {events.length === 0 && (
        <div className="card text-center py-12">
          <Clock className="w-10 h-10 text-[#7A8FA6] mx-auto mb-3" />
          <p className="text-[#7A8FA6]">Add events to build your case chronology.</p>
          <p className="text-sm text-[#7A8FA6] mt-1">The AI will detect contradictions and gaps once you have 2+ events.</p>
        </div>
      )}
    </div>
  );
}
