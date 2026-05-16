import { ShoppingBag } from "lucide-react";
export const metadata = { title: "Legal Marketplace" };

const TEMPLATES = [
  { id: "et1", name: "ET1 — Employment Tribunal", category: "Employment", price: "Free", downloads: 12400, rating: 4.9, desc: "Official claim form for unfair dismissal and discrimination" },
  { id: "n1",  name: "N1 — County Court Claim", category: "Civil", price: "Free", downloads: 9200, rating: 4.8, desc: "Money claim for debts and breach of contract" },
  { id: "sar", name: "Subject Access Request", category: "Data Rights", price: "Free", downloads: 8100, rating: 4.9, desc: "GDPR request for all personal data held about you" },
  { id: "dis", name: "Discrimination Bundle", category: "Employment", price: "£9.99", downloads: 3400, rating: 4.7, desc: "Chronology, comparator analysis, remedy schedule" },
  { id: "wit", name: "Witness Statement Pack", category: "Court Documents", price: "Free", downloads: 5600, rating: 4.8, desc: "Formal witness statement template with guidance" },
  { id: "let", name: "Pre-Action Letter Bundle", category: "Civil", price: "£4.99", downloads: 2800, rating: 4.6, desc: "Letter before claim for 8 common dispute types" },
  { id: "lea", name: "Lease Dispute Pack", category: "Housing", price: "Free", downloads: 4100, rating: 4.7, desc: "Section 21, deposit, disrepair — all covered" },
  { id: "imm", name: "Immigration Appeal Pack", category: "Immigration", price: "£14.99", downloads: 1900, rating: 4.5, desc: "Grounds of appeal and supporting statement templates" },
];

const LAWYERS = [
  { name: "Aisha Okonkwo", specialty: "Employment Law", rating: 4.9, reviews: 147, location: "London", rate: "£180/hr", verified: true },
  { name: "James Thornton", specialty: "Housing & Landlord", rating: 4.8, reviews: 89, location: "Manchester", rate: "£150/hr", verified: true },
  { name: "Priya Sharma", specialty: "Immigration", rating: 4.9, reviews: 203, location: "Birmingham", rate: "£200/hr", verified: true },
  { name: "Michael Obi", specialty: "Civil Litigation", rating: 4.7, reviews: 62, location: "Leeds", rate: "£140/hr", verified: true },
];

export default function MarketplacePage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-[#C9A84C]" /> Legal Marketplace
        </h1>
        <p className="text-[#7A8FA6] text-sm mt-1">Court-ready templates · Verified lawyers · Legal skills</p>
      </div>

      {/* Document templates */}
      <section className="mb-12">
        <h2 className="font-bold text-lg mb-4">📋 Court Document Templates</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATES.map(t => (
            <div key={t.id} className="card-hover flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <span className="tag-teal">{t.category}</span>
                <span className={`text-sm font-semibold ${t.price === "Free" ? "text-green-400" : "text-[#C9A84C]"}`}>{t.price}</span>
              </div>
              <h3 className="font-semibold text-[#EEF2F7] mb-1 text-sm">{t.name}</h3>
              <p className="text-xs text-[#7A8FA6] flex-1 mb-3">{t.desc}</p>
              <div className="flex items-center justify-between text-xs text-[#7A8FA6] mb-3">
                <span>⭐ {t.rating} · {t.downloads.toLocaleString()} uses</span>
              </div>
              <button className="btn-primary text-sm py-2 w-full">
                {t.price === "Free" ? "Use template" : "Purchase"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Lawyer directory */}
      <section>
        <h2 className="font-bold text-lg mb-4">👤 Verified Lawyers</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {LAWYERS.map(l => (
            <div key={l.name} className="card-hover flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#1E3A5F] flex items-center justify-center text-xl font-bold text-[#C9A84C] shrink-0">
                {l.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[#EEF2F7]">{l.name}</p>
                    <p className="text-xs text-[#7A8FA6]">{l.specialty} · {l.location}</p>
                  </div>
                  {l.verified && <span className="tag-teal shrink-0">✓ Verified</span>}
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="text-[#C9A84C]">⭐ {l.rating}</span>
                  <span className="text-[#7A8FA6]">{l.reviews} reviews</span>
                  <span className="text-[#EEF2F7] font-medium">{l.rate}</span>
                </div>
                <button className="btn-secondary text-xs py-1.5 px-3 mt-3">Book consultation</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
