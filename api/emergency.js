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

function getEscalationLevel(daysUntilHearing) {
  if (daysUntilHearing <= 1) return 4;
  if (daysUntilHearing <= 3) return 4;
  if (daysUntilHearing <= 7) return 3;
  if (daysUntilHearing <= 14) return 2;
  return 1;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  if (req.method === 'GET') {
    const { caseId } = req.query;
    const { data, error } = await supabase
      .from('emergency_escalations')
      .select('*')
      .eq('user_id', user.id)
      .eq(caseId ? 'case_id' : 'user_id', caseId || user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ escalation: data });
  }

  if (req.method === 'POST') {
    const { caseId, hearingDate, notes } = req.body;
    if (!caseId || !hearingDate) return res.status(400).json({ error: 'caseId and hearingDate required' });

    const hearing = new Date(hearingDate);
    const now = new Date();
    const daysUntilHearing = Math.ceil((hearing - now) / (1000 * 60 * 60 * 24));
    const level = getEscalationLevel(daysUntilHearing);

    const { data: existing } = await supabase
      .from('emergency_escalations')
      .select('id')
      .eq('case_id', caseId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (existing) {
      await supabase
        .from('emergency_escalations')
        .update({ escalation_level: level, days_until_hearing: daysUntilHearing })
        .eq('id', existing.id);
    } else {
      await supabase.from('emergency_escalations').insert({
        case_id: caseId,
        user_id: user.id,
        escalation_level: level,
        hearing_date: hearingDate,
        days_until_hearing: daysUntilHearing,
        notes,
      });
    }

    const protocol = getProtocol(level, daysUntilHearing);

    if (level >= 3) {
      const { data: helpers } = await supabase
        .from('helpers')
        .select('id,helper_type,trust_level,specialty,avg_rating')
        .eq('verification_status', 'verified')
        .eq('available', true)
        .gte('trust_level', level >= 4 ? 4 : 3)
        .in('helper_type', ['solicitor', 'barrister', 'paralegal'])
        .order('trust_level', { ascending: false })
        .limit(3);

      protocol.matchedHelpers = helpers || [];
    }

    return res.status(200).json({
      level,
      daysUntilHearing,
      protocol,
      hearingDate,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function getProtocol(level, days) {
  const base = {
    level,
    daysRemaining: days,
    actions: [],
    contactSupport: false,
    matchSolicitor: false,
  };

  if (level === 1) {
    base.actions = [
      'Review your evidence bundle for completeness',
      'Confirm your ET1 claim form is filed',
      'Check ACAS Early Conciliation certificate',
      'Prepare your witness statement outline',
    ];
  } else if (level === 2) {
    base.actions = [
      'Complete your witness statement immediately',
      'Prepare your document bundle (chronological order)',
      'Draft your schedule of loss',
      'Contact ACAS for any outstanding matters',
      'Review similar successful cases in Case Matcher',
    ];
    base.contactSupport = true;
  } else if (level === 3) {
    base.actions = [
      'URGENT: Finalise all documents today',
      'Serve your bundle on the respondent immediately',
      'Contact tribunal to confirm hearing arrangements',
      'Request a helper match NOW – time critical',
      'Download Emergency Scripts for hearing day',
      'Prepare opening statement',
    ];
    base.contactSupport = true;
    base.matchSolicitor = true;
  } else {
    base.actions = [
      'CRITICAL: Contact a solicitor immediately',
      'Request emergency hearing adjournment if applicable',
      'Ensure all bundles served and tribunal notified',
      'Have emergency scripts ready',
      'UJRIS 24/7 support: support@ujris.co.uk',
    ];
    base.contactSupport = true;
    base.matchSolicitor = true;
  }

  return base;
}
