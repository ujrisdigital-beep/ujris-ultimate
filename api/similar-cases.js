import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { caseType, characteristics = [], summary = '', limit = 10 } = req.body;

  if (!caseType) return res.status(400).json({ error: 'caseType required' });

  try {
    const searchTerms = [caseType, ...characteristics, summary].filter(Boolean).join(' ');

    const { data: cases, error } = await supabase
      .from('similar_cases')
      .select('id,case_type,protected_characteristics,outcome,settlement_amount,strength_score,key_factors,duration_days,employer_size,anonymized_summary,legal_citation,year')
      .textSearch('search_vector', searchTerms.replace(/\s+/g, ' & '), { type: 'websearch' })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    if (!cases || cases.length === 0) {
      const { data: fallback } = await supabase
        .from('similar_cases')
        .select('id,case_type,protected_characteristics,outcome,settlement_amount,strength_score,key_factors,duration_days,employer_size,anonymized_summary,legal_citation,year')
        .eq('case_type', caseType)
        .limit(limit);

      return computeStats(res, fallback || []);
    }

    return computeStats(res, cases);
  } catch (err) {
    console.error('similar-cases error:', err);
    return res.status(500).json({ error: err.message });
  }
}

function computeStats(res, cases) {
  const total = cases.length;
  const won = cases.filter(c => c.outcome === 'won').length;
  const settled = cases.filter(c => c.outcome === 'settled').length;
  const settlements = cases.filter(c => c.settlement_amount > 0).map(c => c.settlement_amount);
  const avgSettlement = settlements.length > 0
    ? Math.round(settlements.reduce((a, b) => a + b, 0) / settlements.length)
    : 0;
  const successRate = total > 0 ? Math.round(((won + settled) / total) * 100) : 0;

  const keyFactors = {};
  cases.forEach(c => (c.key_factors || []).forEach(f => {
    keyFactors[f] = (keyFactors[f] || 0) + 1;
  }));
  const topFactors = Object.entries(keyFactors)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([factor, count]) => ({ factor, count }));

  return res.status(200).json({
    total,
    successRate,
    wonCount: won,
    settledCount: settled,
    averageSettlement: avgSettlement,
    topFactors,
    cases: cases.slice(0, 5),
  });
}
