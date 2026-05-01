import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, getAuthHeader, getCurrentUser } from '../lib/supabase';

const T = {
  cream: '#F8F1E9', navy: '#0F2C4A', navyM: '#FAF6F0', gold: '#D4AF37',
  goldBg: 'rgba(212,175,55,0.12)', border: 'rgba(15,44,74,0.12)',
  muted: '#1E3A5F', dim: '#64748B', red: '#DC2626', redBg: 'rgba(220,38,38,0.08)',
  success: '#10B981', successBg: 'rgba(16,185,129,0.1)', warning: '#F59E0B',
};

const NODE_COLORS = {
  document: '#3B82F6', statement: '#8B5CF6', date: '#F59E0B',
  witness: '#10B981', contradiction: '#EF4444', claim: '#D4AF37',
  communication: '#06B6D4', policy: '#EC4899',
};

const NODE_TYPES = ['document','statement','date','witness','contradiction','claim','communication','policy'];
const EDGE_TYPES = ['contradicts','supports','references','involves','precedes','follows','corroborates'];

function GraphCanvas({ nodes, edges, onNodeClick, selectedNode }) {
  const canvasRef = useRef(null);
  const [positions, setPositions] = useState({});

  useEffect(() => {
    const pos = {};
    const r = 220;
    nodes.forEach((n, i) => {
      const angle = (i / Math.max(nodes.length, 1)) * 2 * Math.PI;
      pos[n.id] = { x: 300 + r * Math.cos(angle), y: 220 + r * Math.sin(angle) };
    });
    setPositions(pos);
  }, [nodes.length]);

  const edgeColor = (type) => {
    const map = { contradicts: '#EF4444', supports: '#10B981', corroborates: '#10B981',
      references: '#3B82F6', involves: '#8B5CF6', precedes: '#F59E0B', follows: '#F59E0B' };
    return map[type] || T.dim;
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 440, background: T.navyM, borderRadius: 12, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
      <svg width="600" height="440" style={{ position: 'absolute', top: 0, left: 0 }}>
        {edges.map(e => {
          const s = positions[e.source_node_id];
          const t = positions[e.target_node_id];
          if (!s || !t) return null;
          return (
            <g key={e.id}>
              <line x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke={edgeColor(e.edge_type)} strokeWidth={2} strokeOpacity={0.7} markerEnd="url(#arrow)" />
              <text x={(s.x + t.x) / 2} y={(s.y + t.y) / 2 - 6} fontSize={9} fill={T.dim} textAnchor="middle">{e.edge_type}</text>
            </g>
          );
        })}
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={T.dim} />
          </marker>
        </defs>
      </svg>
      {nodes.map(n => {
        const pos = positions[n.id];
        if (!pos) return null;
        const isSelected = selectedNode?.id === n.id;
        return (
          <div key={n.id}
            onClick={() => onNodeClick(n)}
            title={n.title}
            style={{
              position: 'absolute',
              left: pos.x - 22,
              top: pos.y - 22,
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: NODE_COLORS[n.node_type] || T.gold,
              border: isSelected ? `3px solid ${T.navy}` : '2px solid white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              color: 'white',
              fontWeight: 700,
              boxShadow: isSelected ? '0 0 0 4px rgba(15,44,74,0.25)' : '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'all 0.15s',
              zIndex: isSelected ? 10 : 1,
              userSelect: 'none',
            }}>
            {n.node_type.slice(0, 3).toUpperCase()}
          </div>
        );
      })}
      {nodes.length === 0 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.dim, fontSize: 14 }}>
          No evidence nodes yet. Add your first node below.
        </div>
      )}
    </div>
  );
}

export default function EvidenceGraph({ caseId }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('graph');
  const [queryFilter, setQueryFilter] = useState('all');
  const [showAddNode, setShowAddNode] = useState(false);
  const [showAddEdge, setShowAddEdge] = useState(false);
  const [user, setUser] = useState(null);

  const [newNode, setNewNode] = useState({ node_type: 'document', title: '', content: '', reliability_score: 70 });
  const [newEdge, setNewEdge] = useState({ source_node_id: '', target_node_id: '', edge_type: 'supports', notes: '' });

  const activeCaseId = caseId || localStorage.getItem('ujris3_activeCaseId')?.replace(/"/g, '') || 'demo';

  useEffect(() => {
    getCurrentUser().then(u => setUser(u));
  }, []);

  const loadGraph = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const headers = await getAuthHeader();
      const q = queryFilter !== 'all' ? `?caseId=${activeCaseId}&query=${queryFilter}` : `?caseId=${activeCaseId}`;
      const res = await fetch(`/api/evidence-graph${q}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [user, activeCaseId, queryFilter]);

  useEffect(() => { if (user) loadGraph(); else setLoading(false); }, [user, loadGraph]);

  async function addNode() {
    if (!newNode.title) return;
    const headers = { ...(await getAuthHeader()), 'Content-Type': 'application/json' };
    const res = await fetch('/api/evidence-graph', {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'add_node', caseId: activeCaseId, node: newNode }),
    });
    if (res.ok) {
      setNewNode({ node_type: 'document', title: '', content: '', reliability_score: 70 });
      setShowAddNode(false);
      loadGraph();
    }
  }

  async function addEdge() {
    if (!newEdge.source_node_id || !newEdge.target_node_id) return;
    const headers = { ...(await getAuthHeader()), 'Content-Type': 'application/json' };
    await fetch('/api/evidence-graph', {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'add_edge', caseId: activeCaseId, edge: newEdge }),
    });
    setShowAddEdge(false);
    loadGraph();
  }

  async function deleteNode(nodeId) {
    const headers = { ...(await getAuthHeader()), 'Content-Type': 'application/json' };
    await fetch('/api/evidence-graph', {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'delete_node', nodeId }),
    });
    setSelectedNode(null);
    loadGraph();
  }

  const contradictions = edges.filter(e => e.edge_type === 'contradicts');
  const strongNodes = nodes.filter(n => n.reliability_score >= 70);

  if (!user) return (
    <div style={{ padding: 40, textAlign: 'center', background: T.cream, minHeight: '60vh', borderRadius: 12 }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🔗</div>
      <h2 style={{ color: T.navy, marginBottom: 12 }}>Evidence Graph</h2>
      <p style={{ color: T.muted, marginBottom: 24 }}>Sign in to build your case evidence graph and find contradictions automatically.</p>
      <a href="/auth" style={{ background: T.gold, color: 'white', padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>Sign In</a>
    </div>
  );

  return (
    <div style={{ background: T.cream, minHeight: '60vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: T.navy, fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Evidence Graph</h2>
        <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>Map every document, statement, witness and contradiction as a knowledge graph.</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[['all','All Nodes'],['contradictions','Contradictions Only'],['strong','Strong Evidence']].map(([v, l]) => (
          <button key={v} onClick={() => setQueryFilter(v)} style={{ padding: '8px 16px', borderRadius: 20, border: `1px solid ${queryFilter === v ? T.navy : T.border}`, background: queryFilter === v ? T.navy : 'white', color: queryFilter === v ? 'white' : T.muted, fontSize: 12, cursor: 'pointer', fontWeight: queryFilter === v ? 600 : 400 }}>{l}</button>
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={() => setShowAddNode(true)} style={{ padding: '8px 16px', background: T.gold, color: 'white', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>+ Add Node</button>
          {nodes.length > 1 && <button onClick={() => setShowAddEdge(true)} style={{ padding: '8px 16px', background: T.navy, color: 'white', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>+ Link Nodes</button>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Nodes', value: nodes.length, color: T.navy },
          { label: 'Contradictions Found', value: contradictions.length, color: contradictions.length > 0 ? T.red : T.success },
          { label: 'Strong Evidence', value: strongNodes.length, color: T.success },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'white', borderRadius: 10, padding: '14px 18px', border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: T.dim }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <GraphCanvas nodes={nodes} edges={edges} onNodeClick={setSelectedNode} selectedNode={selectedNode} />

      {selectedNode && (
        <div style={{ marginTop: 16, background: 'white', borderRadius: 12, padding: 20, border: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ background: NODE_COLORS[selectedNode.node_type], color: 'white', padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{selectedNode.node_type}</span>
                <span style={{ fontSize: 14, color: T.dim }}>Reliability: {selectedNode.reliability_score}%</span>
              </div>
              <h3 style={{ margin: '0 0 8px', color: T.navy }}>{selectedNode.title}</h3>
              {selectedNode.content && <p style={{ margin: 0, color: T.muted, fontSize: 13 }}>{selectedNode.content}</p>}
            </div>
            <button onClick={() => deleteNode(selectedNode.id)} style={{ background: T.redBg, color: T.red, border: `1px solid ${T.red}`, borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 }}>Delete</button>
          </div>
        </div>
      )}

      {contradictions.length > 0 && (
        <div style={{ marginTop: 16, background: T.redBg, borderRadius: 12, padding: 16, border: `1px solid ${T.red}` }}>
          <h4 style={{ color: T.red, margin: '0 0 8px', fontSize: 14 }}>⚠ {contradictions.length} Contradiction{contradictions.length > 1 ? 's' : ''} Detected</h4>
          {contradictions.map(e => {
            const src = nodes.find(n => n.id === e.source_node_id);
            const tgt = nodes.find(n => n.id === e.target_node_id);
            return (
              <div key={e.id} style={{ fontSize: 12, color: T.red, marginBottom: 4 }}>
                "{src?.title}" contradicts "{tgt?.title}" {e.notes ? `— ${e.notes}` : ''}
              </div>
            );
          })}
        </div>
      )}

      {showAddNode && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 28, width: 440, maxWidth: '90vw' }}>
            <h3 style={{ color: T.navy, marginBottom: 20 }}>Add Evidence Node</h3>
            <select value={newNode.node_type} onChange={e => setNewNode(p => ({ ...p, node_type: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, marginBottom: 12, fontSize: 13, fontFamily: 'inherit' }}>
              {NODE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
            <input value={newNode.title} onChange={e => setNewNode(p => ({ ...p, title: e.target.value }))} placeholder="Title (e.g. 'Manager email 12 Jan 2024')"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, marginBottom: 12, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }} />
            <textarea value={newNode.content} onChange={e => setNewNode(p => ({ ...p, content: e.target.value }))} placeholder="Description / key content..."
              rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, marginBottom: 12, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
            <label style={{ fontSize: 12, color: T.dim }}>Reliability: {newNode.reliability_score}%</label>
            <input type="range" min={0} max={100} value={newNode.reliability_score} onChange={e => setNewNode(p => ({ ...p, reliability_score: parseInt(e.target.value) }))}
              style={{ width: '100%', marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddNode(false)} style={{ padding: '10px 20px', borderRadius: 8, border: `1px solid ${T.border}`, background: 'transparent', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button onClick={addNode} style={{ padding: '10px 20px', borderRadius: 8, background: T.gold, color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Add Node</button>
            </div>
          </div>
        </div>
      )}

      {showAddEdge && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 28, width: 440, maxWidth: '90vw' }}>
            <h3 style={{ color: T.navy, marginBottom: 20 }}>Link Evidence Nodes</h3>
            <label style={{ fontSize: 12, color: T.dim, display: 'block', marginBottom: 4 }}>From Node</label>
            <select value={newEdge.source_node_id} onChange={e => setNewEdge(p => ({ ...p, source_node_id: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, marginBottom: 12, fontSize: 13, fontFamily: 'inherit' }}>
              <option value="">Select node...</option>
              {nodes.map(n => <option key={n.id} value={n.id}>{n.title}</option>)}
            </select>
            <label style={{ fontSize: 12, color: T.dim, display: 'block', marginBottom: 4 }}>Relationship</label>
            <select value={newEdge.edge_type} onChange={e => setNewEdge(p => ({ ...p, edge_type: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, marginBottom: 12, fontSize: 13, fontFamily: 'inherit' }}>
              {EDGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <label style={{ fontSize: 12, color: T.dim, display: 'block', marginBottom: 4 }}>To Node</label>
            <select value={newEdge.target_node_id} onChange={e => setNewEdge(p => ({ ...p, target_node_id: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, marginBottom: 12, fontSize: 13, fontFamily: 'inherit' }}>
              <option value="">Select node...</option>
              {nodes.filter(n => n.id !== newEdge.source_node_id).map(n => <option key={n.id} value={n.id}>{n.title}</option>)}
            </select>
            <input value={newEdge.notes} onChange={e => setNewEdge(p => ({ ...p, notes: e.target.value }))} placeholder="Notes (optional)"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, marginBottom: 16, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddEdge(false)} style={{ padding: '10px 20px', borderRadius: 8, border: `1px solid ${T.border}`, background: 'transparent', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button onClick={addEdge} style={{ padding: '10px 20px', borderRadius: 8, background: T.navy, color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Link Nodes</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: T.dim }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
              {type}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
