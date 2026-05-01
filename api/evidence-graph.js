import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function getUser(req) {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token) return null;
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  if (req.method === 'GET') {
    const { caseId, query } = req.query;
    if (!caseId) return res.status(400).json({ error: 'caseId required' });

    const { data: nodes, error: nodesErr } = await supabase
      .from('evidence_nodes')
      .select('*')
      .eq('case_id', caseId)
      .eq('user_id', user.id)
      .order('created_at');

    if (nodesErr) return res.status(500).json({ error: nodesErr.message });

    const nodeIds = (nodes || []).map(n => n.id);

    let edges = [];
    if (nodeIds.length > 0) {
      const { data, error: edgesErr } = await supabase
        .from('evidence_edges')
        .select('*')
        .eq('case_id', caseId)
        .in('source_node_id', nodeIds);

      if (!edgesErr) edges = data || [];
    }

    let filteredNodes = nodes || [];
    let filteredEdges = edges;

    if (query === 'contradictions') {
      const contradictionEdges = edges.filter(e => e.edge_type === 'contradicts');
      const involvedIds = new Set([
        ...contradictionEdges.map(e => e.source_node_id),
        ...contradictionEdges.map(e => e.target_node_id),
      ]);
      filteredNodes = filteredNodes.filter(n => involvedIds.has(n.id));
      filteredEdges = contradictionEdges;
    } else if (query === 'strong') {
      filteredNodes = filteredNodes.filter(n => n.reliability_score >= 70);
      const strongIds = new Set(filteredNodes.map(n => n.id));
      filteredEdges = filteredEdges.filter(e =>
        strongIds.has(e.source_node_id) && strongIds.has(e.target_node_id)
      );
    }

    return res.status(200).json({ nodes: filteredNodes, edges: filteredEdges });
  }

  if (req.method === 'POST') {
    const { action, caseId, node, edge } = req.body;

    if (action === 'add_node') {
      if (!node || !caseId) return res.status(400).json({ error: 'node and caseId required' });
      const { data, error } = await supabase
        .from('evidence_nodes')
        .insert({ ...node, case_id: caseId, user_id: user.id })
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ node: data });
    }

    if (action === 'add_edge') {
      if (!edge || !caseId) return res.status(400).json({ error: 'edge and caseId required' });
      const { data, error } = await supabase
        .from('evidence_edges')
        .insert({ ...edge, case_id: caseId })
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ edge: data });
    }

    if (action === 'delete_node') {
      const { nodeId } = req.body;
      const { error } = await supabase
        .from('evidence_nodes')
        .delete()
        .eq('id', nodeId)
        .eq('user_id', user.id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Unknown action' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
