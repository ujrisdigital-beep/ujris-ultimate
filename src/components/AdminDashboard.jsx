import React, { useState, useEffect } from 'react';
import { getCurrentUser, getAuthHeader } from '../lib/supabase';

const T = {
  cream: '#F8F1E9', navy: '#0F2C4A', navyM: '#FAF6F0', gold: '#D4AF37',
  goldBg: 'rgba(212,175,55,0.12)', border: 'rgba(15,44,74,0.12)',
  muted: '#1E3A5F', dim: '#64748B', red: '#DC2626', redBg: 'rgba(220,38,38,0.08)',
  success: '#10B981', successBg: 'rgba(16,185,129,0.1)', warning: '#F59E0B',
};

function MetricCard({ label, value, sub, color }) {
  return (
    <div style={{ background: 'white', borderRadius: 10, padding: '18px 20px', border: `1px solid ${T.border}` }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || T.navy }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: T.dim, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [activeTab, setActiveTab] = useState('metrics');

  const [courtOrderForm, setCourtOrderForm] = useState({
    courtOrderNumber: '', courtOrderDate: '', issuingCourt: '',
    accessReason: '', targetUserId: '', secondAdminId: '',
  });
  const [piiResult, setPiiResult] = useState(null);
  const [piiLoading, setPiiLoading] = useState(false);

  useEffect(() => {
    getCurrentUser().then(async u => {
      setUser(u);
      if (u) {
        const { data } = await (await import('../lib/supabase')).supabase
          .from('user_profiles')
          .select('is_admin')
          .eq('id', u.id)
          .single();
        setIsAdmin(!!data?.is_admin);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadMetrics();
      loadWarnings();
    }
  }, [isAdmin]);

  async function loadMetrics() {
    const headers = await getAuthHeader();
    const res = await fetch('/api/admin?action=metrics', { headers });
    if (res.ok) {
      const data = await res.json();
      setMetrics(data);
    }
  }

  async function loadWarnings() {
    const headers = await getAuthHeader();
    const res = await fetch('/api/admin?action=warnings', { headers });
    if (res.ok) {
      const data = await res.json();
      setWarnings(data.warnings || []);
    }
  }

  async function resolveWarning(id) {
    const headers = { ...(await getAuthHeader()), 'Content-Type': 'application/json' };
    await fetch('/api/admin?action=resolve-warning', {
      method: 'POST',
      headers,
      body: JSON.stringify({ warningId: id }),
    });
    loadWarnings();
  }

  async function requestPIIAccess() {
    if (!courtOrderForm.courtOrderNumber || !courtOrderForm.secondAdminId) {
      alert('Court order number and second admin ID are required.');
      return;
    }
    setPiiLoading(true);
    const headers = { ...(await getAuthHeader()), 'Content-Type': 'application/json' };
    const res = await fetch('/api/admin?action=pii-access', {
      method: 'POST',
      headers,
      body: JSON.stringify(courtOrderForm),
    });
    const data = await res.json();
    if (res.ok) {
      setPiiResult(data);
    } else {
      alert('PII access denied: ' + data.error);
    }
    setPiiLoading(false);
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: T.dim }}>Loading...</div>;

  if (!user) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h3 style={{ color: T.navy }}>Admin Dashboard</h3>
      <p style={{ color: T.muted }}>Admin access required. Please sign in with an admin account.</p>
      <a href="/auth" style={{ background: T.gold, color: 'white', padding: '10px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, display: 'inline-block', marginTop: 12 }}>Sign In</a>
    </div>
  );

  if (!isAdmin) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
      <h3 style={{ color: T.navy }}>Access Restricted</h3>
      <p style={{ color: T.muted }}>This dashboard is restricted to platform administrators only.</p>
    </div>
  );

  const warnColors = { 1: T.dim, 2: T.warning, 3: T.red };
  const warnLabels = { 1: 'Info', 2: 'Warning', 3: 'Critical' };

  return (
    <div style={{ background: T.cream, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: T.navy, fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Admin Dashboard</h2>
          <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>Platform metrics, warnings, and court-order PII access.</p>
        </div>
        <div style={{ fontSize: 11, color: T.dim, background: T.redBg, padding: '6px 12px', borderRadius: 8 }}>
          ⚠ All admin actions are logged with timestamp and IP
        </div>
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: `2px solid ${T.border}`, marginBottom: 24 }}>
        {[['metrics','Platform Metrics'],['warnings','Warning System'],['pii','Court Order Access']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            padding: '10px 20px', background: 'none', border: 'none',
            borderBottom: activeTab === id ? `3px solid ${T.gold}` : '3px solid transparent',
            color: activeTab === id ? T.navy : T.dim, fontWeight: activeTab === id ? 700 : 400,
            cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
          }}>{label}</button>
        ))}
      </div>

      {activeTab === 'metrics' && metrics && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            <MetricCard label="Total Users" value={metrics.metrics.totalUsers || 0} sub="All registered accounts" />
            <MetricCard label="Total Cases" value={metrics.metrics.totalCases || 0} sub="Across all users" />
            <MetricCard label="Active Escalations" value={metrics.metrics.activeEscalations || 0} sub="Emergency mode" color={metrics.metrics.activeEscalations > 0 ? T.red : T.success} />
            <MetricCard label="Unresolved Warnings" value={metrics.metrics.unresolvedWarnings || 0} sub="Need review" color={metrics.metrics.unresolvedWarnings > 5 ? T.red : T.warning} />
            <MetricCard label="Verified Helpers" value={metrics.metrics.verifiedHelpers || 0} sub="Active in network" color={T.success} />
            <MetricCard label="Published Documents" value={metrics.metrics.publishedDocuments || 0} sub="In marketplace" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ background: 'white', borderRadius: 12, padding: 20, border: `1px solid ${T.border}` }}>
              <h4 style={{ color: T.navy, margin: '0 0 12px' }}>Warning Level Breakdown</h4>
              {Object.entries(metrics.warningBreakdown || {}).map(([level, count]) => (
                <div key={level} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 13, color: warnColors[level] || T.dim }}>Level {level} – {warnLabels[level]}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: warnColors[level] || T.dim }}>{count}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'white', borderRadius: 12, padding: 20, border: `1px solid ${T.border}` }}>
              <h4 style={{ color: T.navy, margin: '0 0 12px' }}>Recent Cases</h4>
              {(metrics.recentCases || []).map(c => (
                <div key={c.id} style={{ padding: '8px 0', borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 13, color: T.navy, fontWeight: 600 }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: T.dim }}>{c.status} · {new Date(c.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <button onClick={loadMetrics} style={{ padding: '10px 20px', background: T.navy, color: 'white', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>Refresh Metrics</button>
          </div>
        </div>
      )}

      {activeTab === 'warnings' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ color: T.navy, margin: 0 }}>AI Warning Log</h3>
            <button onClick={loadWarnings} style={{ padding: '8px 16px', background: T.navy, color: 'white', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Refresh</button>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {warnings.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: T.dim }}>No unresolved warnings.</div>}
            {warnings.map(w => (
              <div key={w.id} style={{ background: 'white', borderRadius: 10, padding: '16px 20px', border: `2px solid ${warnColors[w.warning_level] || T.dim}`, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ minWidth: 80, textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: warnColors[w.warning_level] }}>L{w.warning_level}</div>
                  <div style={{ fontSize: 10, color: warnColors[w.warning_level], fontWeight: 600 }}>{warnLabels[w.warning_level]}</div>
                  <div style={{ fontSize: 10, color: T.dim, marginTop: 4 }}>{(w.ai_confidence * 100).toFixed(0)}% confidence</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.navy, marginBottom: 4 }}>{w.feature}</div>
                  {w.context && <div style={{ fontSize: 12, color: T.muted, marginBottom: 6 }}>{w.context.slice(0, 200)}{w.context.length > 200 ? '...' : ''}</div>}
                  {w.ai_instructions && <div style={{ fontSize: 11, color: T.dim, background: T.navyM, padding: '8px 10px', borderRadius: 6 }}>{w.ai_instructions}</div>}
                  <div style={{ fontSize: 10, color: T.dim, marginTop: 6 }}>{new Date(w.created_at).toLocaleString()}</div>
                </div>
                {!w.resolved && (
                  <button onClick={() => resolveWarning(w.id)}
                    style={{ padding: '6px 12px', background: T.successBg, color: T.success, border: `1px solid ${T.success}`, borderRadius: 6, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Resolve
                  </button>
                )}
                {w.resolved && <span style={{ fontSize: 11, color: T.success, fontWeight: 600 }}>✓ Resolved</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pii' && (
        <div style={{ maxWidth: 580 }}>
          <div style={{ background: T.redBg, borderRadius: 10, padding: '14px 18px', marginBottom: 24, border: `1px solid ${T.red}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.red, marginBottom: 4 }}>⚖ Court Order PII Access</div>
            <div style={{ fontSize: 12, color: T.red, lineHeight: 1.5 }}>
              PII access requires: (1) Valid court order number, (2) Second admin approval, (3) All access logged with court order ID. Misuse is a criminal offence under the Data Protection Act 2018.
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, padding: 24, border: `1px solid ${T.border}` }}>
            <h4 style={{ color: T.navy, margin: '0 0 16px' }}>Court Order Details</h4>
            <div style={{ display: 'grid', gap: 12 }}>
              <input value={courtOrderForm.courtOrderNumber} onChange={e => setCourtOrderForm(p => ({ ...p, courtOrderNumber: e.target.value }))} placeholder="Court Order Number (e.g. CO-2026-001234)"
                style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit' }} />
              <input type="date" value={courtOrderForm.courtOrderDate} onChange={e => setCourtOrderForm(p => ({ ...p, courtOrderDate: e.target.value }))}
                style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit' }} />
              <input value={courtOrderForm.issuingCourt} onChange={e => setCourtOrderForm(p => ({ ...p, issuingCourt: e.target.value }))} placeholder="Issuing Court (e.g. High Court of Justice)"
                style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit' }} />
              <textarea value={courtOrderForm.accessReason} onChange={e => setCourtOrderForm(p => ({ ...p, accessReason: e.target.value }))} placeholder="Reason for access (must match court order)" rows={3}
                style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }} />
              <input value={courtOrderForm.targetUserId} onChange={e => setCourtOrderForm(p => ({ ...p, targetUserId: e.target.value }))} placeholder="Target User ID (UUID)"
                style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit' }} />
              <input value={courtOrderForm.secondAdminId} onChange={e => setCourtOrderForm(p => ({ ...p, secondAdminId: e.target.value }))} placeholder="Second Admin ID (UUID) – required for approval"
                style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit' }} />
            </div>
            <button onClick={requestPIIAccess} disabled={piiLoading}
              style={{ marginTop: 16, padding: '12px 24px', background: piiLoading ? T.dim : T.red, color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: piiLoading ? 'not-allowed' : 'pointer' }}>
              {piiLoading ? 'Processing...' : 'Request PII Access'}
            </button>
          </div>

          {piiResult && (
            <div style={{ marginTop: 20, background: T.successBg, borderRadius: 12, padding: 20, border: `1px solid ${T.success}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.success, marginBottom: 8 }}>✓ Access Granted – Logged under {piiResult.courtOrderNumber}</div>
              <pre style={{ fontSize: 11, color: T.muted, overflow: 'auto', maxHeight: 200 }}>{JSON.stringify(piiResult.data, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
