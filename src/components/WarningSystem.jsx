import React, { useState, useEffect } from 'react';
import { supabase, getCurrentUser } from '../lib/supabase';

const T = {
  cream: '#F8F1E9', navy: '#0F2C4A', navyM: '#FAF6F0', gold: '#D4AF37',
  goldBg: 'rgba(212,175,55,0.12)', border: 'rgba(15,44,74,0.12)',
  muted: '#1E3A5F', dim: '#64748B', red: '#DC2626', redBg: 'rgba(220,38,38,0.08)',
  success: '#10B981', successBg: 'rgba(16,185,129,0.1)', warning: '#F59E0B',
  warningBg: 'rgba(245,158,11,0.1)',
};

const LEVEL_CONFIG = {
  1: { color: T.dim, bg: 'rgba(100,116,139,0.08)', label: 'Info', icon: 'ℹ', desc: 'AI confidence below 70%. Logged for review.' },
  2: { color: T.warning, bg: T.warningBg, label: 'Warning', icon: '⚠', desc: 'AI confidence below 50%. Review within 7 days.' },
  3: { color: T.red, bg: T.redBg, label: 'Critical', icon: '🚨', desc: 'AI confidence below 30%. Immediate intervention required.' },
};

export async function logAIWarning({ userId, caseId, feature, context, aiResponse, confidence }) {
  if (!confidence || confidence >= 0.7) return;

  const level = confidence < 0.3 ? 3 : confidence < 0.5 ? 2 : 1;

  let aiInstructions = '';
  if (level >= 2) {
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          stream: false,
          system: 'You are a quality control assistant for a legal AI platform. When AI confidence is low, generate specific actionable instructions for the user to improve their case analysis.',
          messages: [{
            role: 'user',
            content: `AI confidence: ${(confidence * 100).toFixed(0)}%. Feature: ${feature}. Context: ${context?.slice(0, 200)}. Write 2-3 specific actions the user should take to get better AI analysis.`,
          }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        aiInstructions = data.content?.[0]?.text || '';
      }
    } catch (e) { }
  }

  await supabase.from('ai_warnings').insert({
    user_id: userId,
    case_id: caseId,
    warning_level: level,
    ai_confidence: confidence,
    feature,
    context: context?.slice(0, 500),
    ai_response: aiResponse?.slice(0, 1000),
    ai_instructions: aiInstructions,
  });

  return { level, aiInstructions };
}

export default function WarningSystem() {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    getCurrentUser().then(async u => {
      setUser(u);
      if (u) loadWarnings(u.id);
      else setLoading(false);
    });
  }, []);

  async function loadWarnings(uid) {
    setLoading(true);
    const { data, error } = await supabase
      .from('ai_warnings')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(50);
    if (!error) setWarnings(data || []);
    setLoading(false);
  }

  async function resolveWarning(id) {
    await supabase.from('ai_warnings').update({ resolved: true, resolved_at: new Date().toISOString() }).eq('id', id);
    if (user) loadWarnings(user.id);
  }

  const filtered = warnings.filter(w => {
    if (!showResolved && w.resolved) return false;
    if (filter !== 'all' && String(w.warning_level) !== filter) return false;
    return true;
  });

  const counts = { 1: 0, 2: 0, 3: 0 };
  warnings.filter(w => !w.resolved).forEach(w => { counts[w.warning_level] = (counts[w.warning_level] || 0) + 1; });

  if (!user) return (
    <div style={{ padding: 40, textAlign: 'center', background: T.cream }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
      <h2 style={{ color: T.navy }}>AI Warning System</h2>
      <p style={{ color: T.muted, marginBottom: 20 }}>Sign in to see your AI confidence warnings and diagnostic reports.</p>
      <a href="/auth" style={{ background: T.gold, color: 'white', padding: '10px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>Sign In</a>
    </div>
  );

  return (
    <div style={{ background: T.cream, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: T.navy, fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>AI Warning System</h2>
        <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>3-level diagnostic system. When AI confidence drops, you get specific guidance to improve your case analysis.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
        {Object.entries(LEVEL_CONFIG).map(([level, cfg]) => (
          <div key={level} style={{ background: cfg.bg, borderRadius: 10, padding: '14px 18px', border: `2px solid ${counts[level] > 0 ? cfg.color : T.border}` }}>
            <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{cfg.icon}</span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: cfg.color }}>{counts[level] || 0}</div>
                <div style={{ fontSize: 11, color: T.dim }}>Level {level} – {cfg.label}</div>
              </div>
            </div>
            <div style={{ fontSize: 10, color: T.dim, marginTop: 6 }}>{cfg.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        {[['all','All Levels'],['1','Level 1 – Info'],['2','Level 2 – Warning'],['3','Level 3 – Critical']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding: '7px 14px', borderRadius: 20, border: `1px solid ${filter === v ? T.navy : T.border}`,
            background: filter === v ? T.navy : 'transparent', color: filter === v ? 'white' : T.muted,
            fontSize: 12, cursor: 'pointer',
          }}>{l}</button>
        ))}
        <label style={{ marginLeft: 'auto', fontSize: 12, color: T.dim, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input type="checkbox" checked={showResolved} onChange={e => setShowResolved(e.target.checked)} />
          Show resolved
        </label>
        <button onClick={() => user && loadWarnings(user.id)} style={{ padding: '7px 14px', border: `1px solid ${T.border}`, borderRadius: 8, background: 'transparent', fontSize: 12, cursor: 'pointer', color: T.dim }}>Refresh</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: T.dim }}>Loading warnings...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 12, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <h3 style={{ color: T.navy, margin: '0 0 8px' }}>All Clear</h3>
          <p style={{ color: T.muted, fontSize: 13 }}>No active warnings. Your AI analyses are running with high confidence.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {filtered.map(w => {
            const cfg = LEVEL_CONFIG[w.warning_level] || LEVEL_CONFIG[1];
            return (
              <div key={w.id} style={{ background: 'white', borderRadius: 12, padding: 20, border: `2px solid ${w.resolved ? T.border : cfg.color}`, opacity: w.resolved ? 0.7 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 20 }}>{cfg.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{cfg.label} – {w.feature}</div>
                      <div style={{ fontSize: 11, color: T.dim }}>Confidence: {(w.ai_confidence * 100).toFixed(0)}% · {new Date(w.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {w.resolved && <span style={{ fontSize: 11, color: T.success, fontWeight: 600 }}>✓ Resolved</span>}
                    {!w.resolved && (
                      <button onClick={() => resolveWarning(w.id)}
                        style={{ padding: '5px 12px', background: T.successBg, color: T.success, border: `1px solid ${T.success}`, borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>

                {w.context && (
                  <div style={{ background: T.navyM, borderRadius: 8, padding: '8px 12px', fontSize: 12, color: T.muted, marginBottom: 10 }}>
                    <strong>Context:</strong> {w.context.slice(0, 250)}{w.context.length > 250 ? '...' : ''}
                  </div>
                )}

                {w.ai_instructions && (
                  <div style={{ background: cfg.bg, borderRadius: 8, padding: '10px 14px', border: `1px solid ${cfg.color}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: cfg.color, marginBottom: 6 }}>AI-Generated Guidance</div>
                    <div style={{ fontSize: 12, color: T.navy, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{w.ai_instructions}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 20, background: T.goldBg, borderRadius: 12, padding: 16, border: `1px solid ${T.gold}` }}>
        <h4 style={{ color: T.navy, margin: '0 0 8px', fontSize: 13 }}>How the Warning System Works</h4>
        <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.7 }}>
          Every AI response is assigned a confidence score. When confidence drops below thresholds, warnings are created automatically:<br/>
          <strong>Level 1 (&lt;70%):</strong> Logged silently — review when convenient.<br/>
          <strong>Level 2 (&lt;50%):</strong> Dashboard alert — review within 7 days. AI generates specific instructions.<br/>
          <strong>Level 3 (&lt;30%):</strong> Critical alert — immediate intervention. AI writes a detailed recovery plan.
        </div>
      </div>
    </div>
  );
}
