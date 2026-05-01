import React, { useState, useEffect } from 'react';

const T = {
  navy: '#0D1B2A', navyMid: '#152438', navyLight: '#1E3A5F',
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.15)',
  teal: '#0C7B7A', tealLight: 'rgba(12,123,122,0.15)',
  white: '#EEF2F7', muted: '#7A8FA6', border: 'rgba(255,255,255,0.08)',
  red: '#E53E3E', green: '#22C55E', orange: '#D97706',
};

const SEED_ACTIONS = [
  { id: '1', title: 'File witness statement for Aldi hearing', caseRef: '770MC038', status: 'in-progress', priority: 'high', due: '2026-04-28', notes: 'Include CCTV evidence reference' },
  { id: '2', title: 'Submit ET bundle to Fairwinds tribunal', caseRef: '6016884/2025', status: 'todo', priority: 'high', due: '2026-07-15', notes: '7 days before hearing' },
  { id: '3', title: 'Send SAR follow-up to Aldi HR', caseRef: '770MC038', status: 'todo', priority: 'medium', due: '2026-05-01', notes: 'Original SAR sent 10 March' },
  { id: '4', title: 'Chase ICO complaint acknowledgement', caseRef: '6016884/2025', status: 'todo', priority: 'medium', due: '2026-05-10', notes: '' },
  { id: '5', title: 'Complete Vento band calculation', caseRef: '6016884/2025', status: 'done', priority: 'low', due: '2026-04-20', notes: 'Upper band applies — £35,100-£56,200' },
];

const STATUS_CONFIG = {
  todo: { label: 'To Do', color: T.muted, bg: 'rgba(122,143,166,0.12)', icon: '○' },
  'in-progress': { label: 'In Progress', color: T.gold, bg: T.goldLight, icon: '◐' },
  done: { label: 'Done', color: T.teal, bg: T.tealLight, icon: '●' },
};

const PRIORITY_CONFIG = {
  high: { label: 'High', color: T.red },
  medium: { label: 'Medium', color: T.orange },
  low: { label: 'Low', color: T.muted },
};

function daysUntil(dateStr) {
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

export default function ActionTracker({ caseId }) {
  const [actions, setActions] = useState(() => {
    const s = localStorage.getItem('ujris_actions');
    return s ? JSON.parse(s) : SEED_ACTIONS;
  });
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', caseRef: '', status: 'todo', priority: 'high', due: '', notes: '' });

  useEffect(() => {
    localStorage.setItem('ujris_actions', JSON.stringify(actions));
  }, [actions]);

  function addAction() {
    if (!form.title) return;
    setActions(prev => [...prev, { ...form, id: Date.now().toString() }]);
    setForm({ title: '', caseRef: '', status: 'todo', priority: 'high', due: '', notes: '' });
    setShowAdd(false);
  }

  function cycleStatus(id) {
    setActions(prev => prev.map(a => {
      if (a.id !== id) return a;
      const order = ['todo', 'in-progress', 'done'];
      const next = order[(order.indexOf(a.status) + 1) % order.length];
      return { ...a, status: next };
    }));
  }

  function deleteAction(id) {
    setActions(prev => prev.filter(a => a.id !== id));
  }

  const filtered = actions.filter(a => filter === 'all' || a.status === filter || (filter === 'overdue' && daysUntil(a.due) < 0 && a.status !== 'done'));
  const sortedFiltered = [...filtered].sort((a, b) => {
    const pOrder = { high: 0, medium: 1, low: 2 };
    if (pOrder[a.priority] !== pOrder[b.priority]) return pOrder[a.priority] - pOrder[b.priority];
    return new Date(a.due) - new Date(b.due);
  });

  const stats = {
    total: actions.length,
    todo: actions.filter(a => a.status === 'todo').length,
    inProgress: actions.filter(a => a.status === 'in-progress').length,
    done: actions.filter(a => a.status === 'done').length,
    overdue: actions.filter(a => a.due && daysUntil(a.due) < 0 && a.status !== 'done').length,
  };

  return (
    <div style={{ minHeight: '100vh', background: T.navy, color: T.white, fontFamily: "'Source Serif 4', Georgia, serif" }}>
      <div style={{ background: T.navyMid, borderBottom: `1px solid ${T.border}`, padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontFamily: "'Playfair Display', Georgia, serif", color: T.gold }}>✅ Action Tracker</h1>
            <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13 }}>Manage case actions, tasks, and follow-ups across all cases</p>
          </div>
          <button onClick={() => setShowAdd(true)} style={{
            padding: '10px 20px', background: T.gold, color: T.navy, border: 'none', borderRadius: 8,
            fontWeight: 700, cursor: 'pointer', fontSize: 14,
          }}>+ Add Action</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All', count: stats.total, color: T.white },
            { key: 'todo', label: 'To Do', count: stats.todo, color: T.muted },
            { key: 'in-progress', label: 'In Progress', count: stats.inProgress, color: T.gold },
            { key: 'done', label: 'Done', count: stats.done, color: T.teal },
            { key: 'overdue', label: 'Overdue', count: stats.overdue, color: T.red },
          ].map(s => (
            <button key={s.key} onClick={() => setFilter(s.key)} style={{
              background: filter === s.key ? `${s.color}22` : 'transparent',
              border: `1px solid ${filter === s.key ? s.color : T.border}`,
              borderRadius: 20, padding: '6px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ color: s.color, fontWeight: 700, fontSize: 16 }}>{s.count}</span>
              <span style={{ color: filter === s.key ? s.color : T.muted, fontSize: 12 }}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {showAdd && (
          <div style={{ background: T.navyMid, border: `1px solid ${T.gold}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <h3 style={{ margin: '0 0 16px', color: T.gold, fontFamily: "'Playfair Display', Georgia, serif" }}>New Action Item</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              {[
                { key: 'title', label: 'Action *', type: 'text', placeholder: 'What needs to be done?' },
                { key: 'caseRef', label: 'Case Ref', type: 'text', placeholder: 'e.g. 770MC038' },
                { key: 'due', label: 'Due Date', type: 'date' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', color: T.muted, fontSize: 11, marginBottom: 4 }}>{f.label}</label>
                  <input type={f.type} value={form[f.key]} placeholder={f.placeholder}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: '100%', background: T.navy, border: `1px solid ${T.border}`, borderRadius: 6, color: T.white, padding: '8px 10px', fontSize: 13, boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', color: T.muted, fontSize: 11, marginBottom: 4 }}>Priority</label>
                <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                  style={{ width: '100%', background: T.navy, border: `1px solid ${T.border}`, borderRadius: 6, color: T.white, padding: '8px 10px', fontSize: 13 }}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block', color: T.muted, fontSize: 11, marginBottom: 4 }}>Notes</label>
              <input value={form.notes} placeholder="Additional notes..."
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                style={{ width: '100%', background: T.navy, border: `1px solid ${T.border}`, borderRadius: 6, color: T.white, padding: '8px 10px', fontSize: 13, boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={addAction} style={{ padding: '10px 20px', background: T.gold, color: T.navy, border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Add Action</button>
              <button onClick={() => setShowAdd(false)} style={{ padding: '10px 20px', background: 'transparent', color: T.muted, border: `1px solid ${T.border}`, borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sortedFiltered.map(action => {
            const days = action.due ? daysUntil(action.due) : null;
            const overdue = days !== null && days < 0 && action.status !== 'done';
            const sc = STATUS_CONFIG[action.status];
            const pc = PRIORITY_CONFIG[action.priority];
            return (
              <div key={action.id} style={{
                background: T.navyMid, border: `1px solid ${overdue ? T.red : action.status === 'done' ? T.teal + '44' : T.border}`,
                borderRadius: 12, padding: 18, display: 'flex', gap: 16, alignItems: 'flex-start',
                opacity: action.status === 'done' ? 0.75 : 1,
              }}>
                <button onClick={() => cycleStatus(action.id)} title="Click to cycle status" style={{
                  background: sc.bg, border: `2px solid ${sc.color}`, borderRadius: '50%', width: 36, height: 36,
                  cursor: 'pointer', fontSize: 14, color: sc.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{sc.icon}</button>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ background: sc.bg, color: sc.color, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>{sc.label}</span>
                    <span style={{ background: `${pc.color}22`, color: pc.color, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>{pc.label.toUpperCase()}</span>
                    {action.caseRef && <span style={{ color: T.gold, fontSize: 11 }}>{action.caseRef}</span>}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: action.status === 'done' ? T.muted : T.white, textDecoration: action.status === 'done' ? 'line-through' : 'none', marginBottom: 4 }}>{action.title}</div>
                  {action.notes && <div style={{ color: T.muted, fontSize: 12, fontStyle: 'italic' }}>{action.notes}</div>}
                  {action.due && (
                    <div style={{ marginTop: 6, fontSize: 12, color: overdue ? T.red : days <= 7 ? T.orange : T.muted }}>
                      {overdue ? `⚠️ Overdue by ${Math.abs(days)} days` : `📅 Due ${new Date(action.due).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} (${days} days)`}
                    </div>
                  )}
                </div>

                <button onClick={() => deleteAction(action.id)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 16 }}>🗑️</button>
              </div>
            );
          })}
          {sortedFiltered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: T.muted }}>No actions match this filter.</div>
          )}
        </div>
      </div>
    </div>
  );
}
