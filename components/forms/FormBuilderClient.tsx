"use client";
import { useState } from "react";
import Link from "next/link";
import { FileText, Download, ChevronLeft, Loader2 } from "lucide-react";
import { JURISDICTIONS } from "@/lib/utils";
import toast from "react-hot-toast";

const FORMS_BY_JURISDICTION: Record<string, Array<{ id: string; name: string; desc: string; fields: string[] }>> = {
  GB: [
    { id: "ET1",   name: "ET1 — Employment Tribunal Claim",   desc: "Unfair dismissal, discrimination, wage claims",      fields: ["claimantName","respondentName","employmentStart","employmentEnd","claimType","facts","remedy"] },
    { id: "N1",    name: "N1 — County Court Claim",            desc: "Money claims, breach of contract, debt",             fields: ["claimantName","defendantName","claimAmount","particulars","courtName"] },
    { id: "N244",  name: "N244 — Application Notice",          desc: "Applications within existing proceedings",           fields: ["claimantName","defendantName","caseNumber","applicationFor","reasons"] },
    { id: "C100",  name: "C100 — Child Arrangements",          desc: "Child arrangements, prohibited steps, specific issue",fields: ["applicantName","respondentName","childName","childDOB","orderSought","reasons"] },
    { id: "FL401", name: "FL401 — Non-Molestation Order",      desc: "Domestic violence injunction application",           fields: ["applicantName","respondentName","relationship","incidents","urgency"] },
    { id: "N5B",   name: "N5B — Possession Claim",             desc: "Landlord possession claim",                         fields: ["landlordName","tenantName","propertyAddress","rentArrears","grounds"] },
  ],
  US: [
    { id: "CIVIL_COMPLAINT", name: "Civil Complaint",           desc: "Federal or state civil action",                     fields: ["plaintiffName","defendantName","jurisdiction","causes","relief"] },
    { id: "TRO",             name: "Temporary Restraining Order",desc: "Emergency injunctive relief",                      fields: ["plaintiffName","defendantName","harm","irreparability","balance"] },
  ],
  NG: [
    { id: "ORIGINATING_SUMMONS", name: "Originating Summons",  desc: "Federal High Court Nigeria",                        fields: ["applicantName","respondentName","questions","facts","relief"] },
    { id: "FUNDAMENTAL_RIGHTS",  name: "Fundamental Rights Enforcement", desc: "Chapter IV CFRN 1999 enforcement",         fields: ["applicantName","respondentName","rightsViolated","facts","remedy"] },
  ],
};

const DEFAULT_FORMS = [
  { id: "SAR",  name: "Subject Access Request (GDPR)",       desc: "Data subject rights request",           fields: ["yourName","orgName","yourAddress","dataTypes","reason"] },
  { id: "PRE_ACTION", name: "Pre-Action Letter Before Claim", desc: "Letter before proceedings — 8 types",  fields: ["yourName","recipientName","claimType","facts","amountClaimed","responseDeadline"] },
  { id: "WITNESS_STATEMENT", name: "Witness Statement",       desc: "Formal witness statement",              fields: ["witnessName","witnessAddress","caseReference","statements"] },
];

interface Props {
  caseData: { id: string; title: string; jurisdiction: string; category: string };
}

export default function FormBuilderClient({ caseData }: Props) {
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [fields, setFields]             = useState<Record<string, string>>({});
  const [generating, setGenerating]     = useState(false);
  const [docText, setDocument]         = useState("");

  const jurisLabel = JURISDICTIONS.find(j => j.code === caseData.jurisdiction)?.label ?? caseData.jurisdiction;
  const jurisdictionForms = FORMS_BY_JURISDICTION[caseData.jurisdiction] ?? [];
  const allForms = [...jurisdictionForms, ...DEFAULT_FORMS];

  function selectForm(form: any) {
    setSelectedForm(form);
    setFields({});
    setDocument("");
  }

  async function generate() {
    if (!selectedForm) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/sue", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          claimType:    selectedForm.name,
          jurisdiction: caseData.jurisdiction,
          facts:        { caseTitle: caseData.title, ...fields },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDocument(data.docText);
    } catch (err: any) {
      toast.error(err.message ?? "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  function download() {
    const blob = new Blob([docText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `${selectedForm?.id ?? "form"}_${caseData.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href={`/case/${caseData.id}`} className="flex items-center gap-1 text-sm text-[#7A8FA6] hover:text-[#C9A84C] mb-3">
          <ChevronLeft className="w-4 h-4" /> Back to case
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#C9A84C]" /> Court Form Builder
        </h1>
        <p className="text-[#7A8FA6] text-sm mt-1">{caseData.title} · {jurisLabel}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Form selector */}
        <div className="space-y-2">
          <h2 className="font-semibold text-sm text-[#7A8FA6] uppercase tracking-wider mb-3">Select form</h2>
          {allForms.map(form => (
            <button key={form.id} onClick={() => selectForm(form)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${selectedForm?.id === form.id ? "border-[#C9A84C] bg-[#C9A84C]/10" : "border-white/10 hover:border-white/30"}`}>
              <p className="font-medium text-sm text-[#EEF2F7]">{form.name}</p>
              <p className="text-xs text-[#7A8FA6] mt-0.5">{form.desc}</p>
            </button>
          ))}
        </div>

        {/* Fields + output */}
        <div className="md:col-span-2">
          {!selectedForm ? (
            <div className="card text-center py-16">
              <FileText className="w-10 h-10 text-[#7A8FA6] mx-auto mb-3" />
              <p className="text-[#7A8FA6]">Select a form to get started</p>
            </div>
          ) : !docText ? (
            <div className="card">
              <h2 className="font-bold mb-4">{selectedForm.name}</h2>
              <div className="space-y-3 mb-6">
                {selectedForm.fields.map((f: string) => (
                  <div key={f}>
                    <label className="block text-xs text-[#7A8FA6] mb-1 capitalize">{f.replace(/([A-Z])/g, " $1")}</label>
                    <textarea rows={f === "facts" || f === "particulars" || f === "statements" || f === "incidents" ? 4 : 1}
                      value={fields[f] ?? ""}
                      onChange={e => setFields(prev => ({ ...prev, [f]: e.target.value }))}
                      className="input-field w-full resize-none"
                    />
                  </div>
                ))}
              </div>
              <button onClick={generate} disabled={generating}
                className="btn-primary w-full flex items-center justify-center gap-2">
                {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : "Generate docText"}
              </button>
            </div>
          ) : (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold">Generated Document</h2>
                <div className="flex gap-2">
                  <button onClick={() => setDocument("")} className="btn-secondary text-sm">Edit</button>
                  <button onClick={download} className="btn-primary text-sm flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-[#EEF2F7] leading-relaxed font-mono bg-[#0D1B2A] border border-white/10 rounded-lg p-4 overflow-auto max-h-[500px]">
                {docText}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
