"use client";
import { useState, useRef } from "react";
import { Search, Copy, ExternalLink, Mic, MicOff, BookOpen, TrendingUp } from "lucide-react";
import { JURISDICTIONS } from "@/lib/utils";
import toast from "react-hot-toast";

const SUGGESTED = [
  "Constructive dismissal — loss of trust and confidence test",
  "Unfair dismissal — Burchell test band of reasonable responses",
  "Race discrimination — comparator direct discrimination",
  "Disability discrimination — reasonable adjustments employer duty",
  "Whistleblowing — protected disclosure detriment",
  "CCTV footage disclosure employment tribunal",
  "Vento guidelines injury to feelings bands 2025",
  "Without prejudice privilege save as to costs",
  "Spoliation of evidence civil proceedings",
  "Schedule of loss unfair dismissal Polkey reduction",
];

interface Citation {
  name: string; citation: string; court: string; year: string; relevance: string;
}

interface Result {
  analysis: string; citations: Citation[]; strategy: string;
}

export default function ResearchPanel() {
  const [query, setQuery]         = useState("");
  const [jurisdiction, setJuris]  = useState("GB");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<Result | null>(null);
  const [history, setHistory]     = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);

  async function search(q = query) {
    if (!q.trim()) return;
    setLoading(true);
    setResult(null);
    setHistory(h => [q, ...h.filter(x => x !== q)].slice(0, 10));
    try {
      const r = await fetch("/api/research", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ query: q, jurisdiction }),
      });
      if (!r.ok) throw new Error();
      setResult(await r.json());
    } catch {
      toast.error("Research failed — check your connection");
    } finally {
      setLoading(false);
    }
  }

  function toggleVoice() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return toast.error("Voice not supported in this browser");
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    const rec = new SR();
    recRef.current = rec;
    rec.lang = "en-GB";
    rec.continuous = false;
    rec.onresult = (e: any) => {
      setQuery(e.results[0][0].transcript);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
  }

  function copyCitation(c: Citation) {
    const text = `${c.name} ${c.citation ? `[${c.citation}]` : ""} (${c.court}, ${c.year})`;
    navigator.clipboard?.writeText(text).then(() => toast.success("Copied")).catch(() => {});
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Search className="w-6 h-6 text-[#C9A84C]" /> AI Legal Research
        </h1>
        <p className="text-[#7A8FA6] text-sm mt-1">Verbatim citations from BAILII, CourtListener, CanLII, AustLII — zero hallucinations</p>
      </div>

      {/* Search */}
      <div className="space-y-3 mb-6">
        <div className="flex gap-2">
          <select value={jurisdiction} onChange={e => setJuris(e.target.value)} className="input-field w-48 shrink-0">
            {JURISDICTIONS.map(j => <option key={j.code} value={j.code}>{j.label}</option>)}
          </select>
          <div className="relative flex-1">
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && search()}
              placeholder="Search case law, statutes, legal principles…"
              className="input-field pr-12"
            />
            <button onClick={toggleVoice}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${listening ? "text-red-400 voice-active" : "text-[#7A8FA6] hover:text-[#C9A84C]"}`}
            >
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
          <button onClick={() => search()} disabled={loading || !query.trim()}
            className="btn-primary shrink-0 flex items-center gap-2"
          >
            {loading ? <span className="animate-spin">⟳</span> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>

        {/* Suggested queries */}
        <div className="flex flex-wrap gap-2">
          {SUGGESTED.slice(0, 5).map(s => (
            <button key={s} onClick={() => { setQuery(s); search(s); }}
              className="text-xs px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-[#7A8FA6] hover:text-[#EEF2F7] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4 animate-pulse">⚖️</div>
          <p className="text-[#7A8FA6]">Searching case law databases…</p>
          <p className="text-xs text-[#7A8FA6] mt-1">Checking BAILII, CourtListener, statute databases</p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Analysis */}
          <div className="card">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#C9A84C]" /> Legal Analysis
            </h2>
            <div className="text-sm text-[#EEF2F7] whitespace-pre-wrap leading-relaxed">{result.analysis}</div>
          </div>

          {/* Citations */}
          {result.citations.length > 0 && (
            <div className="card">
              <h2 className="font-semibold mb-3">📚 Case Citations ({result.citations.length})</h2>
              <div className="space-y-3">
                {result.citations.map((c, i) => (
                  <div key={i} className="bg-white/3 rounded-lg p-4 border border-white/5 group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#EEF2F7]">{c.name}</p>
                        {c.citation && <p className="text-[#C9A84C] text-sm font-mono mt-0.5">[{c.citation}]</p>}
                        <p className="text-xs text-[#7A8FA6] mt-1">{c.court} · {c.year}</p>
                        <p className="text-sm text-[#EEF2F7] mt-2">{c.relevance}</p>
                      </div>
                      <button onClick={() => copyCitation(c)}
                        className="shrink-0 p-2 text-[#7A8FA6] hover:text-[#C9A84C] opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strategy */}
          {result.strategy && (
            <div className="card border-[#C9A84C]/20">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#C9A84C]" /> Recommended Strategy
              </h2>
              <div className="text-sm text-[#EEF2F7] whitespace-pre-wrap leading-relaxed">{result.strategy}</div>
            </div>
          )}

          <p className="text-xs text-[#7A8FA6] text-center">
            ⚠️ UJRIS provides information only, not legal advice. Verify all citations independently via BAILII or Westlaw.
          </p>
        </div>
      )}

      {/* History sidebar */}
      {history.length > 0 && !loading && !result && (
        <div className="card">
          <h3 className="font-semibold mb-3 text-sm">Recent searches</h3>
          <ul className="space-y-1">
            {history.map(h => (
              <li key={h}>
                <button onClick={() => { setQuery(h); search(h); }}
                  className="text-sm text-[#7A8FA6] hover:text-[#EEF2F7] text-left w-full py-1"
                >
                  {h}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
