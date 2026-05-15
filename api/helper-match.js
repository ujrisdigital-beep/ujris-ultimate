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

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('helpers')
      .select('id,helper_type,trust_level,specialty,geography,bio,years_experience,cases_helped,avg_rating,total_reviews,available')
      .eq('verification_status', 'verified')
      .eq('available', true)
      .order('trust_level', { ascending: false })
      .order('avg_rating', { ascending: false })
      .limit(20);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ helpers: data });
  }

  if (req.method === 'POST') {
    const { caseType, geography, urgency = 'standard', hearingDate } = req.body;

    let query = supabase
      .from('helpers')
      .select('id,helper_type,trust_level,specialty,geography,bio,years_experience,cases_helped,avg_rating,total_reviews,available,max_concurrent_cases,active_cases')
      .eq('verification_status', 'verified')
      .eq('available', true);

    if (urgency === 'emergency' || urgency === 'critical') {
      query = query.gte('trust_level', 3);
    }

    const { data: helpers, error } = await query.limit(50);
    if (error) return res.status(500).json({ error: error.message });

    const scored = (helpers || []).map(h => {
      let score = h.trust_level * 20 + (h.avg_rating || 0) * 4;

      if (caseType && (h.specialty || []).some(s =>
        s.toLowerCase().includes(caseType.toLowerCase()) ||
        caseType.toLowerCase().includes(s.toLowerCase())
      )) score += 30;

      if (geography && (h.geography || []).some(g =>
        g.toLowerCase().includes(geography.toLowerCase()) ||
        geography.toLowerCase().includes(g.toLowerCase())
      )) score += 20;

      const capacity = h.max_concurrent_cases - h.active_cases;
      if (capacity <= 0) score -= 50;

      if (urgency === 'emergency') {
        if (h.helper_type === 'solicitor' || h.helper_type === 'barrister') score += 40;
      }

      return { ...h, matchScore: Math.min(100, Math.max(0, Math.round(score))) };
    });

    const ranked = scored
      .filter(h => h.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);

    return res.status(200).json({ helpers: ranked, urgency });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
