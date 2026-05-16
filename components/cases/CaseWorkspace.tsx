"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { MessageSquare, Upload, Calendar, FileText, AlertTriangle, ChevronRight, Mic, MicOff, Send } from "lucide-react";
import { formatDate, deadlineStatus, daysUntil, JURISDICTIONS } from "@/lib/utils";
import toast from "react-hot-toast";

interface Props {
  caseData: any;
  deadlines: any[];
  userId: string;
}

const TABS = [
  { id: "ai",        label: "AI Companion",   icon: "🤖" },
  { id: "timeline",  label: "Timeline",        icon: "📅" },
  { id: "evidence",  label: "Evidence",        icon: "📁" },
  { id: "deadlines", label: "Deadlines",       icon: "⏰" },
  { id: "forms",     label: "Court Forms",     icon: "📋" },
];

export default function CaseWorkspace({ caseData, deadlines, userId }: Props) {
  const [activeTab, setActiveTab] = useState("ai");
  const [messages, setMessages]   = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput]         = useState("");
  const [sending, setSending]     = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const jurisLabel = JURISDICTIONS.find(j => j.code === caseData.jurisdiction)?.label ?? caseData.jurisdiction;
  const urgentDeadlines = deadlines.filter(d => ["overdue", "urgent"].includes(deadlineStatus(d.dueDate)));

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setSending(true);

    try {
      const r = await fetch("/api/ai", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          caseId:       caseData.id,
          jurisdiction: caseData.jurisdiction,
          messages:     [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          context:      `Case: ${caseData.title}\nCategory: ${caseData.category}\nDescription: ${caseData.description ?? ""}`,
        }),
      });
      const data = await r.json();
      setMessages(m => [...m, { role: "assistant", content: data.reply }]);
      setTimeout(() => chatRef.current?.scrollTo(0, chatRef.current.scrollHeight), 50);
    } catch {
      toast.error("AI request failed");
    } finally {
      setSending(false);
    }
  }

  function toggleVoice() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return toast.error("Voice not supported");
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    const rec = new SR();
    recRef.current = rec;
    rec.lang = "en-GB"; rec.continuous = false;
    rec.onresult = (e: any) => { setInput(e.results[0][0].transcript); setListening(false); };
    rec.onend = () => setListening(false);
    rec.start(); setListening(true);
  }

  async function detectContradictions() {
    setSending(true);
    try {
      const r = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "contradictions",
          caseId: caseData.id,
          jurisdiction: caseData.jurisdiction,
          messages: [],
          context: `Case: ${caseData.title}\nDescription: ${caseData.description}`,
        }),
      });
      const d = await r.json();
      setMessages(m => [...m, { role: "assistant", content: `📊 **Contradiction Analysis**\n\n${d.reply}` }]);
      setActiveTab("ai");
    } catch {
      toast.error("Analysis failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Case header */}
      <div className="bg-[#0D1B2A] border-b border-white/8 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-[#7A8FA6] mb-1">
              <Link href="/dashboard" className="hover:text-[#C9A84C]">Dashboard</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="truncate">{caseData.title}</span>
            </div>
            <h1 className="text-xl font-bold text-[#EEF2F7] truncate">{caseData.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="tag-teal">{caseData.category}</span>
              <span className="text-xs text-[#7A8FA6]">{jurisLabel}</span>
              <span className="text-xs text-[#7A8FA6]">Updated {formatDate(caseData.updatedAt)}</span>
            </div>
          </div>
          {urgentDeadlines.length > 0 && (
            <div className="tag-red flex items-center gap-1 shrink-0">
              <AlertTriangle className="w-3 h-3" /> {urgentDeadlines.length} urgent
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 -mb-4">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all ${activeTab === t.id ? "border-[#C9A84C] text-[#C9A84C] bg-[#152438]" : "border-transparent text-[#7A8FA6] hover:text-[#EEF2F7]"}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden bg-[#0D1B2A]">

        {/* AI Companion */}
        {activeTab === "ai" && (
          <div className="flex flex-col h-full">
            {/* Suggestions */}
            <div className="px-6 py-3 border-b border-white/8 flex gap-2 flex-wrap">
              <span className="text-xs text-[#7A8FA6] self-center">Quick:</span>
              {[
                "What are my strongest arguments?",
                "What evidence am I missing?",
                "What are the key deadlines?",
                "Analyse contradictions",
              ].map(s => (
                <button key={s} onClick={() => s === "Analyse contradictions" ? detectContradictions() : setInput(s)}
                  className="text-xs px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-[#7A8FA6] hover:text-[#EEF2F7] transition-colors">
                  {s}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🤖</div>
                  <p className="text-[#7A8FA6]">Your AI legal companion is ready.</p>
                  <p className="text-sm text-[#7A8FA6] mt-1">Ask anything about your case, the law, or next steps.</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-[#C9A84C] text-[#0D1B2A]" : "bg-[#1E3A5F] text-[#EEF2F7]"}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-[#1E3A5F] rounded-2xl px-4 py-3 text-sm text-[#7A8FA6]">
                    <span className="animate-pulse">Thinking…</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-6 pb-6 pt-3 border-t border-white/8">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder={`Ask anything about this ${caseData.category.toLowerCase()} case…`}
                    className="input-field pr-12"
                  />
                  <button onClick={toggleVoice}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${listening ? "text-red-400 voice-active" : "text-[#7A8FA6] hover:text-[#C9A84C]"}`}
                  >
                    {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
                <button onClick={sendMessage} disabled={sending || !input.trim()} className="btn-primary shrink-0">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        {activeTab === "timeline" && (
          <div className="p-6 overflow-y-auto h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg">Case Timeline</h2>
              <button onClick={detectContradictions} disabled={sending} className="btn-secondary text-sm">
                🔍 Detect contradictions
              </button>
            </div>
            <p className="text-[#7A8FA6] text-sm">
              Add events to build your chronology. The AI will identify contradictions and gaps.
            </p>
            <Link href={`/case/${caseData.id}/timeline`} className="btn-primary mt-4 inline-flex items-center gap-2">
              Open full timeline editor →
            </Link>
          </div>
        )}

        {/* Evidence */}
        {activeTab === "evidence" && (
          <div className="p-6 overflow-y-auto h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg">Evidence Vault ({caseData.evidence?.length ?? 0} files)</h2>
              <Link href={`/case/${caseData.id}/documents`} className="btn-primary text-sm flex items-center gap-1">
                <Upload className="w-4 h-4" /> Upload evidence
              </Link>
            </div>
            {(caseData.evidence ?? []).length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-4xl mb-3">📁</div>
                <p className="text-[#7A8FA6]">No evidence uploaded yet.</p>
                <Link href={`/case/${caseData.id}/documents`} className="btn-primary mt-4 inline-block text-sm">
                  Upload your first document →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {caseData.evidence.map((e: any) => (
                  <div key={e.id} className="card flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-[#EEF2F7] truncate">{e.originalName}</p>
                      <p className="text-xs text-[#7A8FA6]">{e.type} · {formatDate(e.uploadedAt)}</p>
                    </div>
                    <span className="tag-teal shrink-0">{e.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Deadlines */}
        {activeTab === "deadlines" && (
          <div className="p-6 overflow-y-auto h-full">
            <h2 className="font-bold text-lg mb-6">Deadlines</h2>
            {deadlines.length === 0 ? (
              <p className="text-[#7A8FA6]">No deadlines set for this case.</p>
            ) : (
              <div className="space-y-3">
                {deadlines.map(d => {
                  const st = deadlineStatus(d.dueDate);
                  return (
                    <div key={d.id} className="card flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-sm">{d.title}</p>
                        <p className="text-xs text-[#7A8FA6]">{formatDate(d.dueDate)}</p>
                      </div>
                      <span className={`tag ${st === "overdue" ? "tag-red" : st === "urgent" ? "bg-orange-500/15 text-orange-400 tag" : st === "soon" ? "tag-gold" : "tag-green"}`}>
                        {st === "overdue" ? "OVERDUE" : `${daysUntil(d.dueDate)}d`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <Link href={`/case/${caseData.id}/deadlines`} className="btn-secondary mt-4 inline-flex text-sm">
              Manage deadlines →
            </Link>
          </div>
        )}

        {/* Forms */}
        {activeTab === "forms" && (
          <div className="p-6 overflow-y-auto h-full">
            <h2 className="font-bold text-lg mb-6">Court Forms</h2>
            <Link href={`/case/${caseData.id}/forms`} className="btn-primary inline-flex items-center gap-2">
              <FileText className="w-4 h-4" /> Open form builder →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
