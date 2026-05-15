import React, { useState, useEffect, lazy, Suspense } from 'react';

const T = {
  navy: '#0D1B2A',
  navyMid: '#152438',
  navyLight: '#1E3A5F',
  gold: '#C9A84C',
  goldLight: 'rgba(201,168,76,0.15)',
  teal: '#0C7B7A',
  tealLight: 'rgba(12,123,122,0.15)',
  white: '#EEF2F7',
  muted: '#7A8FA6',
  border: 'rgba(255,255,255,0.08)',
  borderSolid: 'rgba(255,255,255,0.12)',
  red: '#E53E3E',
  redLight: 'rgba(229,62,62,0.15)',
};

const Spin = () => (
  <div style={{ minHeight: '100vh', background: T.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
    <div style={{ width: 56, height: 56, border: `3px solid ${T.goldLight}`, borderTop: `3px solid ${T.gold}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    <div style={{ color: T.muted, fontFamily: "'Source Serif 4', serif", fontSize: 14 }}>Loading UJRIS...</div>
    <style>{'@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}'}</style>
  </div>
);

const LandingPage = lazy(() => import('./components/LandingPage'));
const CaseDashboard = lazy(() => import('./components/CaseDashboard'));
const HearingRushPack = lazy(() => import('./components/HearingRushPack'));
const EvidenceVault = lazy(() => import('./components/EvidenceUploader'));
const TimelineView = lazy(() => import('./components/TimelineView'));
const ContradictionReport = lazy(() => import('./components/ContradictionReport'));
const ForensicIntelligenceHub = lazy(() => import('./components/ForensicIntelligenceHub'));
const SARIntelligence = lazy(() => import('./components/SARIntelligence'));
const CCTVAnalyser = lazy(() => import('./components/CCTVAnalyser'));
const ProtectionHub = lazy(() => import('./components/ProtectionHub'));
const EducationalHub = lazy(() => import('./components/EducationalHub'));
const WellbeingAndImpact = lazy(() => import('./components/WellbeingAndImpact'));
const DeadlinesCentre = lazy(() => import('./components/DeadlinesCentre'));
const ActionTracker = lazy(() => import('./components/ActionTracker'));
const CommunityForums = lazy(() => import('./components/CommunityForums'));
const LiveRecordingStudio = lazy(() => import('./components/LiveRecordingStudio'));
const CommandCentre = lazy(() => import('./components/CommandCentre'));
const CaseManager = lazy(() => import('./components/CaseManager'));
const UniversalFileIntake = lazy(() => import('./components/UniversalFileIntake'));
const EmailDispatchCentre = lazy(() => import('./components/EmailDispatchCentre'));
const ComparatorIntelligence = lazy(() => import('./components/ComparatorIntelligence'));
const ShamHearingNavigator = lazy(() => import('./components/ShamHearingNavigator'));
const Calculator = lazy(() => import('./components/Calculator'));

const NAV_GROUPS = [
  {
    label: 'HOME',
    items: [
      { id: 'landing', label: 'Home', icon: '🏠' },
      { id: 'dashboard', label: 'Case Dashboard', icon: '📊' },
    ],
  },
  {
    label: 'ACTIVE CASES',
    items: [
      { id: 'hearing-pack', label: 'Hearing Rush Pack', icon: '🚨' },
      { id: 'evidence', label: 'Evidence Vault', icon: '📎' },
      { id: 'timeline', label: 'Timeline', icon: '📅' },
      { id: 'contradictions', label: 'Contradictions', icon: '⚠️' },
      { id: 'comparator', label: 'Comparator Intelligence', icon: '⚖️' },
      { id: 'sham-hearing', label: 'Sham Hearing Navigator', icon: '🔍' },
    ],
  },
  {
    label: 'FORENSIC & INTELLIGENCE',
    items: [
      { id: 'forensic', label: 'Forensic Hub', icon: '🔬' },
      { id: 'sar', label: 'SAR Intelligence', icon: '📂' },
      { id: 'cctv', label: 'CCTV Analyser', icon: '📹' },
      { id: 'file-intake', label: 'Universal File Intake', icon: '📁' },
    ],
  },
  {
    label: 'PROTECTION & RIGHTS',
    items: [
      { id: 'protection', label: 'Protection Hub', icon: '🛡️' },
      { id: 'education', label: 'Educational Hub', icon: '📚' },
    ],
  },
  {
    label: 'ORGANISATION',
    items: [
      { id: 'deadlines', label: 'Deadlines Centre', icon: '⏰' },
      { id: 'actions', label: 'Action Tracker', icon: '✅' },
      { id: 'calculator', label: 'Schedule of Loss', icon: '💰' },
      { id: 'cases', label: 'Case Manager', icon: '🗂️' },
      { id: 'command', label: 'Command Centre', icon: '🎯' },
    ],
  },
  {
    label: 'COMMUNICATIONS',
    items: [
      { id: 'email', label: 'Email Dispatch', icon: '📧' },
      { id: 'recording', label: 'Live Recording Studio', icon: '🎙️' },
      { id: 'community', label: 'Community Forums', icon: '👥' },
    ],
  },
  {
    label: 'WELLBEING',
    items: [
      { id: 'wellbeing', label: 'Wellbeing & Impact', icon: '💚' },
    ],
  },
];

const COMPONENT_MAP = {
  landing: LandingPage,
  dashboard: CaseDashboard,
  'hearing-pack': HearingRushPack,
  evidence: EvidenceVault,
  timeline: TimelineView,
  contradictions: ContradictionReport,
  comparator: ComparatorIntelligence,
  'sham-hearing': ShamHearingNavigator,
  forensic: ForensicIntelligenceHub,
  sar: SARIntelligence,
  cctv: CCTVAnalyser,
  'file-intake': UniversalFileIntake,
  protection: ProtectionHub,
  education: EducationalHub,
  deadlines: DeadlinesCentre,
  actions: ActionTracker,
  calculator: Calculator,
  cases: CaseManager,
  command: CommandCentre,
  email: EmailDispatchCentre,
  recording: LiveRecordingStudio,
  community: CommunityForums,
  wellbeing: WellbeingAndImpact,
};

const CASES = [
  { id: 'aldi', title: 'Aldi Stores Ltd', ref: '770MC038', hearingDate: '2026-05-05', icon: '🛒', urgent: true },
  { id: 'fairwinds', title: 'Fairwinds Health Care Ltd', ref: '6016884/2025', hearingDate: '2026-07-22', icon: '🏥', urgent: false },
];

function daysUntil(dateStr) {
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

function UJRISLogo({ size = 44 }) {
  return (
    <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      <img
        src="/ujris-logo.png"
        alt="UJRIS Shield"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      <div style={{
        display: 'none', width: size, height: size, background: `linear-gradient(135deg, ${T.gold}, #8B6914)`,
        borderRadius: size * 0.15, alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.45, fontWeight: 900, color: T.navy, fontFamily: 'serif',
      }}>U</div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [activeCaseId, setActiveCaseId] = useState('aldi');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem('ujris_tab');
    const c = localStorage.getItem('ujris_case');
    if (s) setTab(s);
    if (c) setActiveCaseId(c);
  }, []);

  useEffect(() => {
    localStorage.setItem('ujris_tab', tab);
    localStorage.setItem('ujris_case', activeCaseId);
  }, [tab, activeCaseId]);

  const activeCase = CASES.find(c => c.id === activeCaseId) || CASES[0];
  const daysLeft = daysUntil(activeCase.hearingDate);
  const CurrentComponent = COMPONENT_MAP[tab] || CaseDashboard;

  const navTo = (id) => {
    setTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <Suspense fallback={<Spin />}>
      <div style={{ minHeight: '100vh', background: T.navy, display: 'flex', flexDirection: 'column', fontFamily: "'Source Serif 4', Georgia, serif" }}>

        {/* TOP BAR */}
        <header style={{
          background: T.navyMid, borderBottom: `1px solid ${T.border}`, padding: '0 20px',
          display: 'flex', alignItems: 'center', gap: 16, height: 60, flexShrink: 0, zIndex: 100,
          position: 'sticky', top: 0,
        }}>
          <button onClick={() => { setSidebarOpen(o => !o); setMobileMenuOpen(o => !o); }}
            style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 20, padding: 4 }}>☰</button>

          <UJRISLogo size={36} />
          <div>
            <div style={{ color: T.white, fontWeight: 700, fontSize: 16, letterSpacing: '0.05em', fontFamily: "'Playfair Display', Georgia, serif" }}>UJRIS™</div>
            <div style={{ color: T.muted, fontSize: 10, letterSpacing: '0.1em' }}>LEGAL INTELLIGENCE SYSTEM</div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Case Selector */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {CASES.map(c => {
              const d = daysUntil(c.hearingDate);
              const isActive = c.id === activeCaseId;
              return (
                <button key={c.id} onClick={() => setActiveCaseId(c.id)} style={{
                  padding: '6px 12px', borderRadius: 8, border: `1px solid ${isActive ? T.gold : T.border}`,
                  background: isActive ? T.goldLight : 'transparent', color: isActive ? T.gold : T.muted,
                  cursor: 'pointer', fontSize: 12, fontWeight: isActive ? 700 : 400, display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span>{c.icon}</span>
                  <span style={{ display: 'none' }}>{c.title}</span>
                  <span style={{ background: d <= 30 ? T.red : T.teal, color: '#fff', borderRadius: 4, padding: '1px 5px', fontSize: 10, fontWeight: 700 }}>{d}d</span>
                </button>
              );
            })}
          </div>

          {/* Hearing Alert */}
          {daysLeft <= 30 && (
            <div style={{ background: T.redLight, border: `1px solid ${T.red}`, borderRadius: 8, padding: '4px 12px', fontSize: 11, color: T.red, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              🚨 {daysLeft}d TO HEARING
            </div>
          )}
        </header>

        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

          {/* SIDEBAR */}
          <aside style={{
            width: sidebarOpen ? 240 : 0, flexShrink: 0, background: T.navyMid,
            borderRight: `1px solid ${T.border}`, overflowY: 'auto', overflowX: 'hidden',
            transition: 'width 0.25s ease', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ padding: '12px 0', minWidth: 240 }}>
              {NAV_GROUPS.map(group => (
                <div key={group.label} style={{ marginBottom: 8 }}>
                  <div style={{ color: T.muted, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', padding: '8px 16px 4px', fontFamily: 'sans-serif' }}>{group.label}</div>
                  {group.items.map(item => (
                    <button key={item.id} onClick={() => navTo(item.id)} style={{
                      width: '100%', textAlign: 'left', background: tab === item.id ? T.goldLight : 'transparent',
                      border: 'none', borderLeft: tab === item.id ? `3px solid ${T.gold}` : '3px solid transparent',
                      color: tab === item.id ? T.gold : T.muted, padding: '9px 16px', cursor: 'pointer',
                      fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s',
                      fontFamily: "'Source Serif 4', Georgia, serif",
                    }}
                      onMouseEnter={e => { if (tab !== item.id) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = T.white; } }}
                      onMouseLeave={e => { if (tab !== item.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.muted; } }}
                    >
                      <span style={{ fontSize: 15 }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              ))}

              {/* Active Case Info */}
              <div style={{ margin: '16px', padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: `1px solid ${T.border}` }}>
                <div style={{ color: T.gold, fontSize: 10, fontWeight: 700, marginBottom: 8, letterSpacing: '0.1em' }}>ACTIVE CASE</div>
                <div style={{ color: T.white, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{activeCase.icon} {activeCase.title}</div>
                <div style={{ color: T.muted, fontSize: 11 }}>{activeCase.ref}</div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, Math.max(0, ((180 - daysLeft) / 180) * 100))}%`, height: '100%', background: daysLeft <= 30 ? T.red : T.gold, borderRadius: 2 }} />
                  </div>
                  <span style={{ color: daysLeft <= 30 ? T.red : T.gold, fontSize: 11, fontWeight: 700 }}>{daysLeft}d</span>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main style={{ flex: 1, overflowY: 'auto', background: T.navy }}>
            <Suspense fallback={<Spin />}>
              <CurrentComponent
                caseId={activeCaseId}
                cases={CASES}
                activeCase={activeCase}
                onNavigate={navTo}
              />
            </Suspense>
          </main>
        </div>

        {/* FOOTER */}
        <footer style={{ background: T.navyMid, borderTop: `1px solid ${T.border}`, padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UJRISLogo size={24} />
            <span style={{ color: T.muted, fontSize: 11 }}>© 2026 UJU GROUP LIMITED. UJRIS™ is a trademark of UJU GROUP LIMITED.</span>
          </div>
          <span style={{ color: T.muted, fontSize: 11 }}>Beta — Not legal advice. Consult a solicitor for your case.</span>
        </footer>
      </div>
    </Suspense>
  );
}
