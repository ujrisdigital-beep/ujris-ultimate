"use client";
import { useState } from "react";
import Link from "next/link";
import { Scale, Search, FileText, Shield, Zap, Globe, ArrowRight, ChevronDown } from "lucide-react";
import { JURISDICTIONS } from "@/lib/utils";
import SueWizard from "@/components/forms/SueWizard";

const FEATURES = [
  { icon: "⚖️", title: "Strategic Case Workspace", desc: "Chronology builder, contradiction detection, and deadline tracking in one place." },
  { icon: "🔍", title: "AI Legal Research", desc: "Verbatim case citations from BAILII, Westlaw, and CourtListener — no hallucinations." },
  { icon: "📋", title: "200+ Court Forms", desc: "ET1, SAR, County Court N1, Small Claims — auto-filled from your case facts." },
  { icon: "🗺️", title: "8 Jurisdictions", desc: "UK, US, Canada, Australia, Germany, France, India, and Nigeria." },
  { icon: "📡", title: "Works Offline", desc: "PWA with IndexedDB — your case data is always available, even without internet." },
  { icon: "🎙️", title: "Voice Dictation", desc: "Speak your facts. UJRIS transcribes and structures them automatically." },
  { icon: "🕸️", title: "Citation Network", desc: "Interactive graph of how cases relate — spot precedent chains at a glance." },
  { icon: "🛡️", title: "Evidence Vault", desc: "Encrypted storage with blockchain-style audit log. Court-admissible chain of custody." },
];

export default function LandingPage() {
  const [showSue, setShowSue] = useState(false);
  const [jurisdiction, setJurisdiction] = useState("GB");

  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      {/* Hero */}
      <header className="border-b border-white/8 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0D1B2A]/95 backdrop-blur z-40">
        <div className="flex items-center gap-2">
          <Scale className="w-6 h-6 text-[#C9A84C]" />
          <span className="text-xl font-black text-[#C9A84C]">UJRIS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-secondary text-sm py-2">Sign in</Link>
          <Link href="/login" className="btn-primary text-sm py-2">Get started free</Link>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="tag-gold mb-6 mx-auto">⚖️ Justice for everyone — in 8 jurisdictions</div>
        <h1 className="text-5xl md:text-6xl font-black text-[#EEF2F7] leading-tight mb-6">
          Your AI legal companion.<br />
          <span className="text-[#C9A84C]">No lawyer fees.</span>
        </h1>
        <p className="text-xl text-[#7A8FA6] max-w-2xl mx-auto mb-10">
          Build your case, research the law, generate court forms, and track deadlines — all powered by AI trained on real case law.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login" className="btn-primary text-base px-8 py-3 flex items-center gap-2 justify-center">
            Start for free <ArrowRight className="w-4 h-4" />
          </Link>
          <button onClick={() => setShowSue(true)} className="btn-secondary text-base px-8 py-3">
            🚀 Try Sue Wizard →
          </button>
        </div>
      </section>

      {/* Sue Wizard Modal */}
      {showSue && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#152438] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold">🚀 Sue Wizard — Small Claims Generator</h2>
              <button onClick={() => setShowSue(false)} className="text-[#7A8FA6] hover:text-white text-2xl">×</button>
            </div>
            <div className="p-6">
              <SueWizard jurisdiction={jurisdiction} />
            </div>
          </div>
        </div>
      )}

      {/* Jurisdiction selector */}
      <section className="max-w-5xl mx-auto px-6 pb-12">
        <div className="card text-center">
          <p className="text-[#7A8FA6] text-sm mb-4 font-medium">Select your jurisdiction to see relevant forms and law</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {JURISDICTIONS.map(j => (
              <button key={j.code} onClick={() => setJurisdiction(j.code)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${jurisdiction === j.code ? "bg-[#C9A84C] text-[#0D1B2A]" : "bg-white/5 text-[#7A8FA6] hover:bg-white/10"}`}
              >
                {j.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything a <span className="text-[#C9A84C]">real legal team</span> uses
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="card-hover">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-[#EEF2F7] mb-1">{f.title}</h3>
              <p className="text-sm text-[#7A8FA6]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/8 py-20 text-center px-6">
        <h2 className="text-3xl font-bold mb-4">Start building your case today</h2>
        <p className="text-[#7A8FA6] mb-8">Free tier available. No credit card required.</p>
        <Link href="/login" className="btn-primary text-base px-10 py-3 inline-flex items-center gap-2">
          Get started free <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <footer className="border-t border-white/8 px-6 py-8 text-center text-xs text-[#7A8FA6]">
        <p>UJRIS provides information only, not legal advice. © 2025 UJRIS Ltd. All rights reserved.</p>
        <div className="flex gap-4 justify-center mt-3">
          <a href="/privacy" className="hover:text-[#C9A84C]">Privacy</a>
          <a href="/terms" className="hover:text-[#C9A84C]">Terms</a>
          <a href="/accessibility" className="hover:text-[#C9A84C]">Accessibility</a>
        </div>
      </footer>
    </div>
  );
}
