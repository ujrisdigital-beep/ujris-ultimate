import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const T = {
  cream: '#FBF7F0', navy: '#1a365d', gold: '#D4AF37', red: '#DC2626',
  warning: '#F59E0B', success: '#10B981', muted: '#64748B',
};

export default function MasterAdminDashboard() {
  const [metrics, setMetrics] = useState({
    ujris: { cases: 0, users: 0, value: 0, status: 'offline' },
    ikenga: { brands: 0, campaigns: 0, revenue: 0, status: 'offline' },
    ujuCycle: { searches: 0, reports: 0, engines: 0, status: 'offline' },
    fortis: { projects: 0, tourism: 0, revenue: 0, status: 'offline' },
  });
  const [alarms, setAlarms] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});

  useEffect(() => { loadAllMetrics(); loadAlarms(); }, []);

  async function loadAllMetrics() {
    // UJRIS Metrics
    const { data: ujrisCases } = await supabase.from('cases').select('*', { count: 'exact' });
    const { data: ujrisUsers } = await supabase.from('user_profiles').select('*', { count: 'exact' });
    
    // IKENGA Metrics (from ikenga API)
    try {
      const ikengaRes = await fetch('https://ikenga.tech/api/metrics', { 
        headers: await getAuthHeader() 
      }).catch(() => null);
      const ikengaData = ikengaRes?.ok ? await ikengaRes.json() : null;
      
      // UJU Cycle Metrics (from uju-cycle API)
      const ujuRes = await fetch('https://ujris.org/api/metrics', { 
        headers: await getAuthHeader() 
      }).catch(() => null);
      const ujuData = ujuRes?.ok ? await ujuRes.json() : null;
      
      // FORTIS Metrics (from fortisinvicta.com API)
      const fortisRes = await fetch('https://fortisinvicta.com/api/metrics', { 
        headers: await getAuthHeader() 
      }).catch(() => null);
      const fortisData = fortisRes?.ok ? await fortisRes.json() : null;

      setMetrics({
        ujris: { 
          cases: ujrisCases?.length || 0, 
          users: ujrisUsers?.length || 0,
          value: ujrisCases?.reduce((sum, c) => sum + (c.case_value || 0), 0) || 0,
          status: 'online'
        },
        ikenga: { 
          brands: ikengaData?.brands || 0, 
          campaigns: ikengaData?.campaigns || 0,
          revenue: ikengaData?.revenue || 0,
          status: ikengaData ? 'online' : 'offline'
        },
        ujuCycle: { 
          searches: ujuData?.searches || 0, 
          reports: ujuData?.reports || 0,
          engines: ujuData?.engines || 5,
          status: ujuData ? 'online' : 'offline'
        },
        fortis: { 
          projects: fortisData?.projects || 0, 
          tourism: fortisData?.tourism || 0,
          revenue: fortisData?.revenue || 0,
          status: fortisData ? 'online' : 'offline'
        },
      });

      setSystemHealth({
        ujris: ikengaData ? 'healthy' : 'degraded',
        ikenga: ikengaData ? 'healthy' : 'offline',
        ujuCycle: ujuData ? 'healthy' : 'offline',
        fortis: fortisData ? 'healthy' : 'offline',
      });
    } catch (e) {
      console.error('Metrics load error:', e);
    }
  }

  async function loadAlarms() {
    const { data } = await supabase
      .from('alarm_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    setAlarms(data || []);
  }

  async function triggerAlarm(level, system, message) {
    await supabase.from('alarm_logs').insert({
      level, system, message, resolved: false, created_at: new Date()
    });
    loadAlarms();
  }

  function getStatusColor(status) {
    return status === 'online' || status === 'healthy' ? T.success : 
           status === 'degraded' ? T.warning : T.red;
  }

  return (
    <div style={{ background: T.cream, minHeight: '100vh', padding: 24, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <h1 style={{ color: T.navy, fontSize: 28, fontWeight: 800, marginBottom: 8 }}>🎯 Master Admin Dashboard</h1>
        <p style={{ color: T.muted, marginBottom: 32 }}>Full metrics across all 4 Ultimate Systems</p>

        {/* System Status Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 32 }}>
          {Object.entries(metrics).map(([system, data]) => (
            <div key={system} style={{ background: 'white', borderRadius: 12, padding: 24, border: `2px solid ${getStatusColor(data.status)}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, color: T.navy, textTransform: 'capitalize' }}>{system.replace(/([A-Z])/g, ' $1')}</h3>
                <span style={{ 
                  background: `${getStatusColor(data.status)}20`, 
                  color: getStatusColor(data.status), 
                  padding: '4px 12px', 
                  borderRadius: 20, 
                  fontSize: 12, 
                  fontWeight: 600 
                }}>{data.status}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {Object.entries(data).filter(([k]) => k !== 'status').map(([key, val]) => (
                  <div key={key}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: T.navy }}>{val?.toLocaleString?.() || val}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>{key}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Alarm Triggers */}
        <div style={{ background: 'white', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: T.navy, marginBottom: 16 }}>🚨 Alarm Controls</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => triggerAlarm(1, 'ujris', 'Case deadline approaching')} 
              style={{ background: T.success, color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>
              Level 1 - UJRIS
            </button>
            <button onClick={() => triggerAlarm(2, 'ikenga', 'Brand mention spike detected')} 
              style={{ background: T.warning, color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>
              Level 2 - IKENGA
            </button>
            <button onClick={() => triggerAlarm(3, 'ujuCycle', 'Search engine failure')} 
              style={{ background: T.red, color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>
              Level 3 - UJU Cycle
            </button>
            <button onClick={() => triggerAlarm(4, 'fortis', 'Payment system failure')} 
              style={{ background: '#7C2D12', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>
              Level 4 - FORTIS
            </button>
          </div>
        </div>

        {/* Alarm Logs */}
        <div style={{ background: 'white', borderRadius: 12, padding: 24 }}>
          <h3 style={{ color: T.navy, marginBottom: 16 }}>📋 Recent Alarms</h3>
          {alarms.length === 0 ? <p style={{ color: T.muted }}>No alarms triggered yet.</p> : (
            <div style={{ overflowX: 'auto' }}>
              {alarms.map(alarm => (
                <div key={alarm.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid #f1f5f9',
                  background: alarm.level >= 3 ? `${T.red}08` : alarm.level === 2 ? `${T.warning}08` : 'transparent'
                }}>
                  <div>
                    <span style={{ 
                      background: alarm.level >= 3 ? T.red : alarm.level === 2 ? T.warning : T.success,
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      marginRight: 12
                    }}>Level {alarm.level}</span>
                    <span style={{ fontWeight: 600 }}>{alarm.system}</span>
                    <span style={{ color: T.muted, marginLeft: 8 }}>{alarm.message}</span>
                  </div>
                  <span style={{ fontSize: 12, color: T.muted }}>{new Date(alarm.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}
