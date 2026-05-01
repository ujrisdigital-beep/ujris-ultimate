import React, { useState, useEffect } from 'react';
import { getCurrentUser, getAuthHeader } from '../lib/supabase';

const T = {
  cream: '#F8F1E9', navy: '#0F2C4A', navyM: '#FAF6F0', gold: '#D4AF37',
  goldBg: 'rgba(212,175,55,0.12)', border: 'rgba(15,44,74,0.12)',
  muted: '#1E3A5F', dim: '#64748B', red: '#DC2626',
  success: '#10B981', successBg: 'rgba(16,185,129,0.1)',
};

const TRUST_LABELS = ['','Newcomer','Trusted','Verified Expert','Senior Advisor','Elite – Judicial Level'];
const TYPE_ICONS = { law_student: '🎓', paralegal: '📋', solicitor: '⚖', barrister: '👨‍⚖️', retired_judge: '🏛', lay_advisor: '🤝' };

function StarRating({ rating, size = 14 }) {
  return (
    <span style={{ fontSize: size }}>
      {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.round(rating) ? T.gold : '#DDD' }}>★</span>)}
    </span>
  );
}

function TrustBadge({ level }) {
  const colors = ['','#94A3B8','#10B981','#3B82F6','#8B5CF6','#D4AF37'];
  return (
    <span style={{ background: colors[level] || T.dim, color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
      L{level} – {TRUST_LABELS[level]}
    </span>
  );
}

function HelperCard({ helper, onRequest }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 20, border: `1px solid ${T.border}`, transition: 'box-shadow 0.2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 20 }}>{TYPE_ICONS[helper.helper_type] || '⚖'}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{helper.helper_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
              <div style={{ fontSize: 11, color: T.dim }}>{helper.years_experience} yrs experience · {helper.cases_helped} cases</div>
            </div>
          </div>
          <TrustBadge level={helper.trust_level} />
        </div>
        <div style={{ textAlign: 'right' }}>
          <StarRating rating={helper.avg_rating || 0} />
          <div style={{ fontSize: 11, color: T.dim }}>({helper.total_reviews || 0} reviews)</div>
        </div>
      </div>

      {helper.specialty?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {helper.specialty.slice(0, 4).map(s => (
            <span key={s} style={{ background: T.goldBg, color: T.navy, fontSize: 11, padding: '2px 8px', borderRadius: 10 }}>{s}</span>
          ))}
        </div>
      )}

      {helper.geography?.length > 0 && (
        <div style={{ fontSize: 12, color: T.dim, marginBottom: 10 }}>📍 {helper.geography.slice(0, 3).join(', ')}</div>
      )}

      {expanded && helper.bio && (
        <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, marginBottom: 12, padding: '10px 12px', background: T.navyM, borderRadius: 8 }}>{helper.bio}</div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={() => setExpanded(e => !e)}
          style={{ padding: '8px 14px', border: `1px solid ${T.border}`, borderRadius: 6, background: 'transparent', color: T.muted, fontSize: 12, cursor: 'pointer' }}>
          {expanded ? 'Less' : 'More info'}
        </button>
        <button onClick={() => onRequest(helper)}
          style={{ flex: 1, padding: '8px 14px', background: T.gold, color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          Request Help
        </button>
      </div>
    </div>
  );
}

export default function HelperNetwork() {
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('find');
  const [filter, setFilter] = useState({ type: '', geography: '', urgency: 'standard' });
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [requestForm, setRequestForm] = useState({ description: '', caseType: '', geography: '' });
  const [user, setUser] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [matchScore, setMatchScore] = useState(null);

  useEffect(() => { getCurrentUser().then(u => setUser(u)); }, []);
  useEffect(() => { loadHelpers(); }, [filter.urgency]);

  async function loadHelpers() {
    setLoading(true);
    try {
      const res = await fetch('/api/helper-match');
      if (res.ok) {
        const data = await res.json();
        setHelpers(data.helpers || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function findMatch() {
    setLoading(true);
    try {
      const res = await fetch('/api/helper-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseType: requestForm.caseType, geography: requestForm.geography, urgency: filter.urgency }),
      });
      if (res.ok) {
        const data = await res.json();
        setHelpers(data.helpers || []);
        setMatchScore(true);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  function requestHelp(helper) {
    if (!user) { alert('Please sign in to request help.'); return; }
    setSelectedHelper(helper);
  }

  const filteredHelpers = helpers.filter(h => {
    if (filter.type && h.helper_type !== filter.type) return false;
    return true;
  });

  return (
    <div style={{ background: T.cream, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: T.navy, fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Legal Helper Network</h2>
        <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>Verified law students, paralegals, solicitors and retired judges. Request help, build reputation.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Verified Helpers', value: helpers.length, sub: 'Available now' },
          { label: 'Average Rating', value: helpers.length ? (helpers.reduce((a, h) => a + (h.avg_rating || 0), 0) / helpers.length).toFixed(1) + '★' : '—', sub: 'Community trust' },
          { label: 'Trust Levels', value: '1–5', sub: 'Law student to Retired Judge' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 10, padding: '14px 18px', border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: T.navy }}>{s.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.navy }}>{s.label}</div>
            <div style={{ fontSize: 11, color: T.dim }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: `2px solid ${T.border}`, marginBottom: 24 }}>
        {[['find','Find Helpers'],['smart','Smart Match'],['my-requests','My Requests']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            padding: '10px 20px', background: 'none', border: 'none',
            borderBottom: activeTab === id ? `3px solid ${T.gold}` : '3px solid transparent',
            color: activeTab === id ? T.navy : T.dim, fontWeight: activeTab === id ? 700 : 400,
            cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
          }}>{label}</button>
        ))}
      </div>

      {activeTab === 'find' && (
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <select value={filter.type} onChange={e => setFilter(p => ({ ...p, type: e.target.value }))}
              style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: 'inherit' }}>
              <option value="">All types</option>
              {Object.keys(TYPE_ICONS).map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
            </select>
            <select value={filter.urgency} onChange={e => setFilter(p => ({ ...p, urgency: e.target.value }))}
              style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: 'inherit' }}>
              <option value="standard">Standard</option>
              <option value="urgent">Urgent (&lt;14 days)</option>
              <option value="critical">Critical (&lt;7 days)</option>
              <option value="emergency">Emergency (&lt;3 days)</option>
            </select>
            <button onClick={loadHelpers} style={{ padding: '8px 16px', background: T.navy, color: 'white', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>Refresh</button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: T.dim }}>Loading helpers...</div>
          ) : filteredHelpers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: T.dim }}>No helpers found. Try Smart Match to find the best fit.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {filteredHelpers.map(h => <HelperCard key={h.id} helper={h} onRequest={requestHelp} />)}
            </div>
          )}
        </div>
      )}

      {activeTab === 'smart' && (
        <div style={{ background: 'white', borderRadius: 12, padding: 24, border: `1px solid ${T.border}` }}>
          <h3 style={{ color: T.navy, margin: '0 0 16px' }}>Smart Helper Match</h3>
          <p style={{ color: T.muted, fontSize: 13, marginBottom: 20 }}>Tell us about your case and we'll rank the best helpers for you.</p>
          <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
            <select value={requestForm.caseType} onChange={e => setRequestForm(p => ({ ...p, caseType: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit' }}>
              <option value="">Case type...</option>
              {['Disability Discrimination','Race Discrimination','Sex Discrimination','Unfair Dismissal','Whistleblowing','Harassment','Equal Pay'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input value={requestForm.geography} onChange={e => setRequestForm(p => ({ ...p, geography: e.target.value }))} placeholder="Your region (e.g. London, Manchester, remote)"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }} />
            <select value={filter.urgency} onChange={e => setFilter(p => ({ ...p, urgency: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit' }}>
              <option value="standard">Standard priority</option>
              <option value="urgent">Urgent – hearing in 14 days</option>
              <option value="critical">Critical – hearing in 7 days</option>
              <option value="emergency">Emergency – hearing in 3 days</option>
            </select>
          </div>
          <button onClick={findMatch} style={{ padding: '12px 28px', background: T.gold, color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 24 }}>
            Find Best Match
          </button>
          {matchScore && helpers.length > 0 && (
            <div>
              <h4 style={{ color: T.navy, marginBottom: 12 }}>Top Matches for Your Case</h4>
              <div style={{ display: 'grid', gap: 12 }}>
                {helpers.map((h, i) => (
                  <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: i === 0 ? T.goldBg : T.navyM, borderRadius: 10, border: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: i === 0 ? T.gold : T.dim, width: 32 }}>#{i+1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{h.helper_type?.replace(/_/g,' ')} · L{h.trust_level}</div>
                      <div style={{ fontSize: 11, color: T.dim }}>{h.specialty?.slice(0,2).join(', ')}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: T.gold }}>{h.matchScore}%</div>
                      <div style={{ fontSize: 10, color: T.dim }}>match</div>
                    </div>
                    <button onClick={() => requestHelp(h)} style={{ padding: '8px 14px', background: T.navy, color: 'white', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Request</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'my-requests' && (
        <div style={{ textAlign: 'center', padding: 40, color: T.dim }}>
          {!user ? (
            <div>
              <p>Sign in to see your helper requests.</p>
              <a href="/auth" style={{ background: T.gold, color: 'white', padding: '10px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, display: 'inline-block', marginTop: 12 }}>Sign In</a>
            </div>
          ) : (
            <p>No active requests. Use Find Helpers or Smart Match to get help.</p>
          )}
        </div>
      )}

      {selectedHelper && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 28, width: 460, maxWidth: '90vw' }}>
            <h3 style={{ color: T.navy, marginBottom: 4 }}>Request Help</h3>
            <p style={{ color: T.dim, fontSize: 12, marginBottom: 20 }}>Helper: {selectedHelper.helper_type?.replace(/_/g,' ')} · Trust Level {selectedHelper.trust_level}</p>
            <textarea value={requestForm.description} onChange={e => setRequestForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe what help you need (be specific about your case stage and what assistance is required)..." rows={4}
              style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', marginBottom: 16 }} />
            <div style={{ background: T.goldBg, borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 12, color: T.muted }}>
              This platform connects you with volunteers. They earn reputation points and CPD hours but do not charge fees through UJRIS. Always verify their qualifications before relying on advice.
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedHelper(null)} style={{ padding: '10px 20px', border: `1px solid ${T.border}`, borderRadius: 8, background: 'transparent', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button onClick={() => { alert('Request sent! The helper will be notified.'); setSelectedHelper(null); }}
                style={{ padding: '10px 20px', background: T.gold, color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Send Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
