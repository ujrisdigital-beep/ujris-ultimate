import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const T = {
  cream: '#F8F1E9', navy: '#0F2C4A', navyM: '#FAF6F0', gold: '#D4AF37',
  goldBg: 'rgba(212,175,55,0.12)', border: 'rgba(15,44,74,0.12)',
  muted: '#1E3A5F', dim: '#64748B', red: '#DC2626', redBg: 'rgba(220,38,38,0.08)',
  success: '#10B981', warning: '#F59E0B',
};

const CAT_COLORS = {
  event: T.navy, document: T.gold, hearing: T.red,
  complaint: T.warning, response: T.success, misconduct: T.red,
};

const CAT_ICONS = {
  event: '📅', document: '📄', hearing: '⚖', complaint: '📮', response: '📬', misconduct: '⚠',
};

const ALDI_EVENTS_FALLBACK = [
  { event_date: '2025-12-03', title: 'INCIDENT AT ALDI STORE', description: 'Claimant attended Aldi store. ASEL Security fabricated false "wheel basket" report. Unlawful detention and assault.', category: 'event', is_key_event: true },
  { event_date: '2025-12-03', title: 'CCTV Captured – Exhibit OO-1', description: 'CCTV footage captures entirety of incident. Directly disproves false "wheel basket" report.', category: 'document', is_key_event: true },
  { event_date: '2025-12-03', title: 'Police Attendance – Alleged Collusion', description: 'SYP officers attend. Alleged colluded with ASEL. Dashcam recording.', category: 'event', is_key_event: true },
  { event_date: '2025-12-15', title: 'Police Complaint CO/0006726', description: 'Formal complaint filed against SYP. Reference CO/0006726.', category: 'complaint', is_key_event: false },
  { event_date: '2026-01-15', title: 'SYP SAR – Dashcam "Lost" (SPOLIATION)', description: 'SYP confirm dashcam footage lost. Adverse inference should be drawn.', category: 'misconduct', is_key_event: true },
  { event_date: '2026-03-01', title: 'N244 Application Filed', description: 'Application Notice N244 filed with County Court.', category: 'document', is_key_event: false },
  { event_date: '2026-05-05', title: 'COUNTY COURT HEARING – 770MC038', description: 'Hearing date for County Court claim.', category: 'hearing', is_key_event: true },
];

const FAIRWINDS_EVENTS_FALLBACK = [
  { event_date: '2024-05-02', title: 'THE ANCHOR LIE – Investigation Meeting', description: 'Claimant: "No supervisions until now." Manager does NOT correct. Admission by conduct.', category: 'event', is_key_event: true },
  { event_date: '2024-05-23', title: 'Probation Review – Suppressed Documents', description: '3 supervision documents SHOWN but withheld. Evidence suppression.', category: 'misconduct', is_key_event: true },
  { event_date: '2024-06-01', title: 'CQC Referral GFC-00014695', description: 'First protected disclosure. ERA 1996 s.43B applies.', category: 'complaint', is_key_event: true },
  { event_date: '2025-05-06', title: 'Pancott Letter – FALSE CERTIFICATION', description: 'Certifies "all documents disclosed." Provably false. Potential fraud.', category: 'misconduct', is_key_event: true },
  { event_date: '2025-08-26', title: 'Leaver Letter', description: 'Employment confirmed until August 2025. Proves timeline.', category: 'document', is_key_event: true },
  { event_date: '2025-09-30', title: 'Payroll Response', description: '"Processed from leaver portal." Corroborates employment timeline.', category: 'response', is_key_event: false },
  { event_date: '2025-10-01', title: 'Action Fraud RF26020132538C', description: 'Action Fraud report filed.', category: 'complaint', is_key_event: true },
  { event_date: '2026-07-22', title: 'EMPLOYMENT TRIBUNAL HEARING', description: 'Race discrimination, whistleblowing, constructive unfair dismissal.', category: 'hearing', is_key_event: true },
];

export default function TimelineView() {
  const [activeCase, setActiveCase] = useState('aldi');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterKey, setFilterKey] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({ event_date: '', title: '', description: '', category: 'event', is_key_event: false });

  useEffect(() => { loadEvents(); }, [activeCase]);

  async function loadEvents() {
    setLoading(true);
    const { data, error } = await supabase
      .from('timeline_events')
      .select('*')
      .eq('case_id', activeCase)
      .order('event_date', { ascending: true });

    if (!error && data && data.length > 0) {
      setEvents(data);
    } else {
      setEvents(activeCase === 'aldi' ? ALDI_EVENTS_FALLBACK : FAIRWINDS_EVENTS_FALLBACK);
    }
    setLoading(false);
  }

  async function addEvent() {
    if (!newEvent.event_date || !newEvent.title) return;
    const { data, error } = await supabase.from('timeline_events').insert({ ...newEvent, case_id: activeCase }).select().single();
    if (!error && data) {
      setEvents(p => [...p, data].sort((a, b) => new Date(a.event_date) - new Date(b.event_date)));
      setNewEvent({ event_date: '', title: '', description: '', category: 'event', is_key_event: false });
      setShowAdd(false);
    } else {
      const synth = { ...newEvent, case_id: activeCase, id: Date.now() };
      setEvents(p => [...p, synth].sort((a, b) => new Date(a.event_date) - new Date(b.event_date)));
      setShowAdd(false);
    }
  }

  const filtered = (filterKey ? events.filter(e => e.is_key_event) : events);

  return (
    <div style={{ background: T.cream, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: T.navy, fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Case Timeline</h2>
        <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>Chronological record of events. Print for court. Identifies the exact sequence of the anchor lie.</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {[['aldi','Aldi 770MC038',T.red],['fairwinds','Fairwinds 6016884/2025',T.gold]].map(([id, label, color]) => (
          <button key={id} onClick={() => setActiveCase(id)} style={{ padding: '10px 20px', borderRadius: 8, border: `2px solid ${activeCase === id ? color : T.border}`, background: activeCase === id ? `${color}15` : 'white', color: T.navy, fontWeight: activeCase === id ? 700 : 400, cursor: 'pointer', fontSize: 13 }}>{label}</button>
        ))}
        <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: T.dim, cursor: 'pointer' }}>
          <input type="checkbox" checked={filterKey} onChange={e => setFilterKey(e.target.checked)} />
          Key events only
        </label>
        <button onClick={() => window.print()} style={{ padding: '10px 16px', background: T.navy, color: 'white', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>🖨 Print</button>
        <button onClick={() => setShowAdd(true)} style={{ padding: '10px 16px', background: T.gold, color: 'white', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>+ Add Event</button>
      </div>

      <div style={{ position: 'relative', paddingLeft: 28 }}>
        <div style={{ position: 'absolute', left: 11, top: 0, bottom: 0, width: 2, background: T.border }} />

        {loading ? <div style={{ padding: 40, textAlign: 'center', color: T.dim }}>Loading timeline...</div> : filtered.map((ev, i) => {
          const isHearing = ev.category === 'hearing';
          const color = CAT_COLORS[ev.category] || T.navy;
          return (
            <div key={ev.id || i} style={{ display: 'flex', gap: 16, marginBottom: 16, position: 'relative' }}>
              <div style={{ position: 'absolute', left: -22, top: 12, width: 20, height: 20, borderRadius: '50%', background: color, border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                {CAT_ICONS[ev.category] || '●'}
              </div>
              <div style={{ flex: 1, background: 'white', borderRadius: 10, padding: '14px 18px', border: `1px solid ${ev.is_key_event ? color : T.border}`, borderLeft: `3px solid ${color}` }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.dim }}>
                    {ev.event_date ? new Date(ev.event_date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date unknown'}
                  </div>
                  <span style={{ fontSize: 10, background: `${color}20`, color, padding: '1px 8px', borderRadius: 10, fontWeight: 600 }}>{ev.category}</span>
                  {ev.is_key_event && <span style={{ fontSize: 10, background: '#000', color: 'white', padding: '1px 8px', borderRadius: 10, fontWeight: 700 }}>KEY</span>}
                </div>
                <div style={{ fontSize: 14, fontWeight: isHearing ? 800 : 700, color: isHearing ? T.red : T.navy, marginBottom: ev.description ? 6 : 0 }}>{ev.title}</div>
                {ev.description && <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>{ev.description}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 28, width: 440, maxWidth: '90vw' }}>
            <h3 style={{ color: T.navy, margin: '0 0 16px' }}>Add Timeline Event</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <input type="date" value={newEvent.event_date} onChange={e => setNewEvent(p => ({ ...p, event_date: e.target.value }))}
                style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit' }} />
              <input value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} placeholder="Event title"
                style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit' }} />
              <textarea value={newEvent.description} onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))} placeholder="Description..." rows={3}
                style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }} />
              <select value={newEvent.category} onChange={e => setNewEvent(p => ({ ...p, category: e.target.value }))}
                style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit' }}>
                {Object.keys(CAT_ICONS).map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
              </select>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={newEvent.is_key_event} onChange={e => setNewEvent(p => ({ ...p, is_key_event: e.target.checked }))} />
                Mark as KEY event
              </label>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setShowAdd(false)} style={{ padding: '10px 20px', border: `1px solid ${T.border}`, borderRadius: 8, background: 'transparent', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button onClick={addEvent} style={{ padding: '10px 20px', background: T.gold, color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Add Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
