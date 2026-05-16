"use client";
import { useState } from "react";
import { JURISDICTIONS } from "@/lib/utils";
import toast from "react-hot-toast";

const CLAIM_TYPES = [
  { id: "unfair_dismissal",    label: "Unfair Dismissal",           icon: "💼" },
  { id: "discrimination",       label: "Discrimination",             icon: "⚖️" },
  { id: "small_claims",         label: "Small Claims (Money Owed)",  icon: "💰" },
  { id: "landlord",             label: "Landlord / Deposit Dispute", icon: "🏠" },
  { id: "consumer",             label: "Consumer Rights",            icon: "🛒" },
  { id: "data_breach",          label: "Data Breach / GDPR",         icon: "🛡️" },
  { id: "harassment",           label: "Harassment / Bullying",      icon: "🚨" },
  { id: "debt",                 label: "Debt / Breach of Contract",  icon: "📄" },
];

const FIELDS: Record<string, Array<{ key: string; label: string; type: string; required?: boolean; rows?: number }>> = {
  unfair_dismissal: [
    { key: "employer_name",   label: "Employer name",         type: "text",     required: true },
    { key: "employment_start",label: "Employment start date",  type: "date",     required: true },
    { key: "employment_end",  label: "Dismissal date",         type: "date",     required: true },
    { key: "job_title",       label: "Job title",              type: "text",     required: true },
    { key: "reason_given",    label: "Reason employer gave",   type: "textarea", required: true },
    { key: "what_happened",   label: "What actually happened", type: "textarea", required: true, rows: 5 },
    { key: "remedy_sought",   label: "Remedy sought",          type: "textarea" },
  ],
  discrimination: [
    { key: "respondent",      label: "Person / organisation",  type: "text",     required: true },
    { key: "protected_char",  label: "Protected characteristic", type: "text",   required: true },
    { key: "incident_dates",  label: "When did this occur?",   type: "text",     required: true },
    { key: "what_happened",   label: "Describe what happened", type: "textarea", required: true, rows: 5 },
    { key: "witnesses",       label: "Any witnesses?",         type: "text" },
    { key: "evidence",        label: "Evidence you have",      type: "textarea" },
  ],
  small_claims: [
    { key: "defendant_name",  label: "Defendant name",         type: "text",     required: true },
    { key: "amount_owed",     label: "Amount owed (£)",        type: "text",     required: true },
    { key: "reason",          label: "Why is this owed?",      type: "textarea", required: true, rows: 4 },
    { key: "attempts",        label: "Steps taken to resolve", type: "textarea" },
    { key: "evidence",        label: "Evidence you have",      type: "textarea" },
  ],
};

interface Props { jurisdiction: string }

export default function SueWizard({ jurisdiction }: Props) {
  const [step, setStep]           = useState(0); // 0=type, 1=facts, 2=result
  const [claimType, setClaimType] = useState("");
  const [juris, setJuris]         = useState(jurisdiction);
  const [facts, setFacts]         = useState<Record<string, string>>({});
  const [result, setResult]       = useState("");
  const [loading, setLoading]     = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const r = await fetch("/api/sue", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ claimType, jurisdiction: juris, facts }),
      });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setResult(d.document);
      setStep(2);
    } catch {
      toast.error("Generation failed");
    } finally {
      setLoading(false);
    }
  }

  function downloadDoc() {
    const blob = new Blob([result], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `ujris-${claimType}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const fields = FIELDS[claimType] ?? [];

  return (
    <div className="space-y-6">
      {/* Step 0: choose type */}
      {step === 0 && (
        <div>
          <p className="text-[#7A8FA6] text-sm mb-4">What type of claim do you want to make?</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {CLAIM_TYPES.map(ct => (
              <button key={ct.id} onClick={() => setClaimType(ct.id)}
                className={`p-3 rounded-xl border text-left text-sm transition-all ${claimType === ct.id ? "border-[#C9A84C] bg-[#C9A84C]/10 text-[#EEF2F7]" : "border-white/10 bg-white/3 text-[#7A8FA6] hover:border-white/30"}`}
              >
                <span className="text-xl block mb-1">{ct.icon}</span>
                {ct.label}
              </button>
            ))}
          </div>
          <div className="mb-4">
            <label className="block text-sm text-[#7A8FA6] mb-1.5">Jurisdiction</label>
            <select value={juris} onChange={e => setJuris(e.target.value)} className="input-field">
              {JURISDICTIONS.map(j => <option key={j.code} value={j.code}>{j.label}</option>)}
            </select>
          </div>
          <button disabled={!claimType} onClick={() => setStep(1)} className="btn-primary w-full">
            Continue →
          </button>
        </div>
      )}

      {/* Step 1: fill facts */}
      {step === 1 && (
        <div>
          <button onClick={() => setStep(0)} className="text-xs text-[#7A8FA6] hover:text-[#EEF2F7] mb-4 flex items-center gap-1">← Back</button>
          <p className="text-[#7A8FA6] text-sm mb-4">Fill in the details — UJRIS will generate your court document</p>
          <div className="space-y-4">
            {fields.length > 0 ? fields.map(f => (
              <div key={f.key}>
                <label className="block text-sm text-[#7A8FA6] mb-1.5">{f.label}{f.required && <span className="text-red-400 ml-1">*</span>}</label>
                {f.type === "textarea" ? (
                  <textarea value={facts[f.key] ?? ""} onChange={e => setFacts(p => ({ ...p, [f.key]: e.target.value }))}
                    rows={f.rows ?? 3} className="input-field resize-none" />
                ) : (
                  <input type={f.type} value={facts[f.key] ?? ""} onChange={e => setFacts(p => ({ ...p, [f.key]: e.target.value }))}
                    className="input-field" />
                )}
              </div>
            )) : (
              <div>
                <label className="block text-sm text-[#7A8FA6] mb-1.5">Describe your situation *</label>
                <textarea value={facts.description ?? ""} onChange={e => setFacts({ description: e.target.value })}
                  rows={6} className="input-field resize-none" placeholder="Explain what happened, who was involved, and what outcome you want…" />
              </div>
            )}
          </div>
          <button onClick={generate} disabled={loading} className="btn-primary w-full mt-6">
            {loading ? "⟳ Generating document…" : "🚀 Generate court document"}
          </button>
        </div>
      )}

      {/* Step 2: result */}
      {step === 2 && (
        <div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4 text-sm text-green-400">
            ✅ Document generated. Review carefully before filing.
          </div>
          <div className="bg-white/3 rounded-xl p-4 border border-white/8 max-h-64 overflow-y-auto">
            <pre className="text-xs text-[#EEF2F7] whitespace-pre-wrap font-mono">{result}</pre>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={downloadDoc} className="btn-primary flex-1">⬇️ Download</button>
            <button onClick={() => { setStep(0); setResult(""); setFacts({}); }} className="btn-secondary flex-1">Start again</button>
          </div>
          <p className="text-xs text-[#7A8FA6] text-center mt-3">⚠️ Review with a solicitor before filing. UJRIS is not legal advice.</p>
        </div>
      )}
    </div>
  );
}
