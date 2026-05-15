import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function getAdminUser(req) {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token) return null;
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return null;
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
  return profile?.is_admin ? user : null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query;

  if (action === 'metrics' && req.method === 'GET') {
    const admin = await getAdminUser(req);
    if (!admin) return res.status(403).json({ error: 'Admin access required' });

    const [
      { count: totalUsers },
      { count: totalCases },
      { count: activeEscalations },
      { count: unresolved },
      { count: helpers },
      { count: documents },
    ] = await Promise.all([
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('cases').select('*', { count: 'exact', head: true }),
      supabase.from('emergency_escalations').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('ai_warnings').select('*', { count: 'exact', head: true }).eq('resolved', false),
      supabase.from('helpers').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified'),
      supabase.from('marketplace_documents').select('*', { count: 'exact', head: true }).eq('is_published', true),
    ]);

    const { data: warningBreakdown } = await supabase
      .from('ai_warnings')
      .select('warning_level')
      .eq('resolved', false);

    const warnCounts = { 1: 0, 2: 0, 3: 0 };
    (warningBreakdown || []).forEach(w => { warnCounts[w.warning_level] = (warnCounts[w.warning_level] || 0) + 1; });

    const { data: recentCases } = await supabase
      .from('cases')
      .select('id,title,status,created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    return res.status(200).json({
      metrics: { totalUsers, totalCases, activeEscalations, unresolvedWarnings: unresolved, verifiedHelpers: helpers, publishedDocuments: documents },
      warningBreakdown: warnCounts,
      recentCases: recentCases || [],
    });
  }

  if (action === 'pii-access' && req.method === 'POST') {
    const admin = await getAdminUser(req);
    if (!admin) return res.status(403).json({ error: 'Admin access required' });

    const {
      courtOrderNumber,
      courtOrderDate,
      issuingCourt,
      accessReason,
      targetUserId,
      targetCaseId,
      secondAdminId,
    } = req.body;

    if (!courtOrderNumber || !courtOrderDate || !issuingCourt || !accessReason) {
      return res.status(400).json({ error: 'Court order details required' });
    }

    if (!secondAdminId) {
      return res.status(400).json({ error: 'Second admin approval required for PII access' });
    }

    const { data: secondAdmin } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', secondAdminId)
      .single();

    if (!secondAdmin?.is_admin) {
      return res.status(400).json({ error: 'Second approver must be a verified admin' });
    }

    await supabase.from('admin_access_log').insert({
      admin_id: admin.id,
      second_admin_id: secondAdminId,
      court_order_number: courtOrderNumber,
      court_order_date: courtOrderDate,
      issuing_court: issuingCourt,
      access_reason: accessReason,
      target_user_id: targetUserId,
      target_case_id: targetCaseId,
      approved_at: new Date().toISOString(),
      approved_by: secondAdminId,
      ip_address: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
    });

    let data = {};
    if (targetUserId) {
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();
      data.user = userData;
    }
    if (targetCaseId) {
      const { data: caseData } = await supabase
        .from('cases')
        .select('*')
        .eq('id', targetCaseId)
        .single();
      data.case = caseData;
    }

    return res.status(200).json({ success: true, data, courtOrderNumber });
  }

  if (action === 'warnings' && req.method === 'GET') {
    const admin = await getAdminUser(req);
    if (!admin) return res.status(403).json({ error: 'Admin access required' });

    const { data, error } = await supabase
      .from('ai_warnings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ warnings: data });
  }

  if (action === 'resolve-warning' && req.method === 'POST') {
    const admin = await getAdminUser(req);
    if (!admin) return res.status(403).json({ error: 'Admin access required' });

    const { warningId } = req.body;
    await supabase
      .from('ai_warnings')
      .update({ resolved: true, resolved_at: new Date().toISOString(), resolved_by: admin.id })
      .eq('id', warningId);

    return res.status(200).json({ success: true });
  }

  return res.status(404).json({ error: 'Unknown admin action' });
}
