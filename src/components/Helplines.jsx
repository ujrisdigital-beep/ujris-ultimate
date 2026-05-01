import React, { useState } from 'react';

const T = {
  navy: '#0D1B2A', navyMid: '#152438', navyLight: '#1E3A5F',
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.15)',
  teal: '#0C7B7A', tealLight: 'rgba(12,123,122,0.15)',
  white: '#EEF2F7', muted: '#7A8FA6',
  border: 'rgba(255,255,255,0.08)',
  red: '#E53E3E', redLight: 'rgba(229,62,62,0.15)',
  green: '#38A169', greenLight: 'rgba(56,161,105,0.15)',
  purple: '#805AD5', purpleLight: 'rgba(128,90,213,0.15)',
  orange: '#DD6B20', orangeLight: 'rgba(221,107,32,0.15)',
};

const HELPLINES = {
  emergency: {
    label: 'Emergency',
    icon: '🚨',
    color: T.red,
    bg: T.redLight,
    entries: [
      { name: 'Police / Ambulance / Fire', number: '999', desc: 'Life-threatening emergencies only', available: '24/7', free: true },
      { name: 'Non-Emergency Police', number: '101', desc: 'To report crime that is not an emergency', available: '24/7', free: true },
      { name: 'NHS Urgent Care', number: '111', desc: 'Medical help that is urgent but not 999', available: '24/7', free: true },
      { name: 'Emergency Europe', number: '112', desc: 'EU/international emergency number', available: '24/7', free: true },
    ],
  },
  domestic: {
    label: 'Domestic Abuse',
    icon: '🏠',
    color: T.orange,
    bg: T.orangeLight,
    entries: [
      { name: 'National DA Helpline', number: '0808 2000 247', desc: 'Run by Refuge. Free, confidential, 24/7', available: '24/7', free: true },
      { name: "Men's Advice Line", number: '0808 801 0327', desc: 'For male victims of domestic abuse', available: 'Mon–Fri 9am–8pm', free: true },
      { name: 'GALOP LGBT+', number: '0800 999 5428', desc: 'DA support for LGBT+ people', available: 'Mon–Fri 10am–5pm', free: true },
      { name: 'Respect Phoneline', number: '0808 802 4040', desc: 'If you are using violence — get help to stop', available: 'Mon–Fri 9am–5pm', free: true },
    ],
  },
  hba: {
    label: 'HBA / Forced Marriage',
    icon: '⚠️',
    color: T.purple,
    bg: T.purpleLight,
    entries: [
      { name: 'Karma Nirvana', number: '0800 5999 247', desc: 'Honour-based abuse and forced marriage', available: 'Mon–Fri 9am–5pm', free: true },
      { name: 'Forced Marriage Unit', number: '020 7008 0151', desc: 'Government unit — overseas & UK cases', available: 'Mon–Fri 9am–5pm', free: true },
      { name: 'Hestia UK SAYS NO MORE', number: '020 7378 3000', desc: 'Specialist VAWG support organisation', available: 'Mon–Fri 9am–5pm', free: false },
    ],
  },
  slavery: {
    label: 'Modern Slavery',
    icon: '🔓',
    color: T.teal,
    bg: T.tealLight,
    entries: [
      { name: 'Modern Slavery Helpline', number: '08000 121 700', desc: 'Report modern slavery and trafficking', available: '24/7', free: true },
      { name: 'Salvation Army Referral', number: '0300 303 8151', desc: 'Victim support and safe house referrals', available: '24/7', free: true },
      { name: 'Migrant Help', number: '0808 8010 503', desc: 'Support for asylum seekers and migrants', available: '24/7', free: true },
    ],
  },
  mental: {
    label: 'Mental Health & Crisis',
    icon: '💚',
    color: T.green,
    bg: T.greenLight,
    entries: [
      { name: 'Samaritans', number: '116 123', desc: 'Free, anonymous emotional support, any time', available: '24/7', free: true },
      { name: 'SHOUT Crisis Text Line', number: '85258', desc: 'Text SHOUT to 85258 — free crisis text support', available: '24/7', free: true },
      { name: 'CALM', number: '0800 585858', desc: 'Campaign Against Living Miserably — men', available: '5pm–midnight', free: true },
      { name: 'Mind Infoline', number: '0300 123 3393', desc: 'Mental health information and signposting', available: 'Mon–Fri 9am–6pm', free: false },
      { name: 'Rethink Mental Illness', number: '0300 5000 927', desc: 'Advice for those affected by mental illness', available: 'Mon–Fri 9:30am–4pm', free: false },
    ],
  },
  legal: {
    label: 'Legal & Rights',
    icon: '⚖️',
    color: T.gold,
    bg: T.goldLight,
    entries: [
      { name: 'Equality Advisory Service (EHRC)', number: '0808 800 0082', desc: 'Discrimination advice — free government service', available: 'Mon–Fri 9am–7pm, Sat 10am–2pm', free: true },
      { name: 'Citizens Advice', number: '0800 144 8848', desc: 'Free advice on rights, benefits, housing, legal', available: 'Mon–Fri 9am–5pm', free: true },
      { name: 'Law Centres Network', number: '020 3637 1330', desc: 'Find a free law centre near you', available: 'Mon–Fri 9am–5pm', free: true },
      { name: 'Legal Aid Agency', number: '0300 200 2020', desc: 'Advice on legal aid eligibility', available: 'Mon–Fri 9am–5pm', free: true },
      { name: 'ACAS Helpline', number: '0300 123 1100', desc: 'Employment rights, disputes, ACAS EC', available: 'Mon–Fri 8am–6pm', free: true },
    ],
  },
};

const CATEGORIES = Object.keys(HELPLINES);

function HelplineCard({ entry, color, bg }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(entry.number).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ color: T.white, fontSize: 14, fontWeight: 700 }}>{entry.name}</span>
          {entry.free && (
            <span style={{ background: T.greenLight, color: T.green, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, letterSpacing: '0.05em' }}>FREE</span>
          )}
        </div>
        <div style={{ color: T.muted, fontSize: 12, marginBottom: 6 }}>{entry.desc}</div>
        <div style={{ color: T.muted, fontSize: 11 }}>⏰ {entry.available}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
        <a href={`tel:${entry.number.replace(/\s/g, '')}`} style={{
          background: color, color: T.navy, borderRadius: 8, padding: '8px 14px',
          fontSize: 14, fontWeight: 800, textDecoration: 'none', letterSpacing: '0.03em', fontFamily: 'monospace',
        }}>{entry.number}</a>
        <button onClick={copy} style={{
          background: 'transparent', border: `1px solid ${T.border}`, color: copied ? T.teal : T.muted,
          borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer',
        }}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export default function Helplines() {
  const [activeCategory, setActiveCategory] = useState('all');

  const visible = activeCategory === 'all' ? CATEGORIES : [activeCategory];

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: T.white, fontFamily: "'Playfair Display', serif", fontSize: 26, margin: 0 }}>
          📞 Helplines
        </h1>
        <p style={{ color: T.muted, margin: '6px 0 0', fontSize: 13 }}>Emergency and support contacts for self-litigants, discrimination victims, and those in crisis</p>
      </div>

      {/* SOS strip */}
      <div style={{ background: T.redLight, border: `1px solid ${T.red}`, borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 28 }}>🚨</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: T.red, fontWeight: 800, fontSize: 15 }}>In immediate danger? Call 999 now.</div>
          <div style={{ color: T.muted, fontSize: 12 }}>Non-emergency police: 101 · NHS urgent care: 111 · Crisis text: SHOUT to 85258</div>
        </div>
        <a href="tel:999" style={{ background: T.red, color: '#fff', borderRadius: 10, padding: '10px 22px', fontWeight: 900, fontSize: 18, textDecoration: 'none', letterSpacing: '0.05em', fontFamily: 'monospace' }}>999</a>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        <button onClick={() => setActiveCategory('all')} style={{
          padding: '7px 16px', borderRadius: 8, border: `1px solid ${activeCategory === 'all' ? T.gold : T.border}`,
          background: activeCategory === 'all' ? T.goldLight : 'transparent', color: activeCategory === 'all' ? T.gold : T.muted,
          cursor: 'pointer', fontSize: 12, fontWeight: 600,
        }}>All</button>
        {CATEGORIES.map(cat => {
          const h = HELPLINES[cat];
          const active = activeCategory === cat;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: '7px 16px', borderRadius: 8, border: `1px solid ${active ? h.color : T.border}`,
              background: active ? h.bg : 'transparent', color: active ? h.color : T.muted,
              cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span>{h.icon}</span><span>{h.label}</span>
            </button>
          );
        })}
      </div>

      {/* Helpline sections */}
      {visible.map(cat => {
        const h = HELPLINES[cat];
        return (
          <div key={cat} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 20 }}>{h.icon}</span>
              <h2 style={{ color: h.color, fontFamily: "'Playfair Display', serif", fontSize: 18, margin: 0 }}>{h.label}</h2>
              <span style={{ marginLeft: 'auto', color: T.muted, fontSize: 11 }}>{h.entries.length} numbers</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {h.entries.map(entry => (
                <HelplineCard key={entry.number} entry={entry} color={h.color} bg={h.bg} />
              ))}
            </div>
          </div>
        );
      })}

      <div style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 20px', textAlign: 'center', marginTop: 8 }}>
        <div style={{ color: T.muted, fontSize: 12 }}>
          All numbers verified as of 2026. UJRIS does not operate any helpline — we signpost to independent services.
          <br />If a number is incorrect, <span style={{ color: T.teal, cursor: 'pointer' }}>let the community know</span>.
        </div>
      </div>
    </div>
  );
}
