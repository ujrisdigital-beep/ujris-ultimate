import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const FAIRWINDS_CONTEXT = `
FAIRWINDS CASE CONTEXT (6016884/2025):
- THE ANCHOR LIE: At the 2 May 2024 investigation meeting, claimant said "No supervisions until now" and the manager did NOT correct this. This is an admission by conduct.
- 23 May 2024: 3 supervision documents were SHOWN to claimant but withheld – evidence suppression.
- 6 May 2025: Pancott letter falsely certified "all documents disclosed" – this is provably false.
- 26 Aug 2025: Leaver letter proves employment continued until August 2025.
- CQC referrals (GFC-00014695, CAS-1302493-Y5Q2J3, CAS-1302478-C5R1C8) = protected disclosures under ERA 1996 s.43B.
- Claims: Race discrimination (EA 2010 s.13), whistleblowing (ERA 1996 s.47B), constructive unfair dismissal.
`;

const ALDI_CONTEXT = `
ALDI CASE CONTEXT (770MC038):
- 3 December 2025: Claimant attended Aldi. ASEL Security falsely reported "wheel basket" incident.
- CCTV Exhibit OO-1 DIRECTLY DISPROVES the wheel basket report.
- Claims: Assault, false imprisonment, police collusion.
- SPOLIATION: SYP dashcam footage from 3 Dec 2025 has been "lost" – court should draw adverse inference.
- Police complaint CO/0006726 filed against SYP.
- N244 application filed with County Court.
`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, caseId, evidenceId, analysisType = 'full' } = req.body;

  if (!text) return res.status(400).json({ error: 'text required' });

  const caseContext = caseId === 'fairwinds' ? FAIRWINDS_CONTEXT : ALDI_CONTEXT;

  const prompts = {
    full: `You are a forensic legal analyst. Analyse this document in the context of the case.

${caseContext}

DOCUMENT TEXT:
${text}

Provide a structured analysis covering:
1. KEY DATES found in this document (list each date and what happened)
2. KEY FACTS established by this document
3. CONTRADICTIONS with known case facts (reference specific anchor lies if relevant)
4. ANCHOR LIES detected (statements that should have been corrected but weren't)
5. SPOLIATION indicators (evidence destroyed or concealed)
6. HOW THIS DOCUMENT HELPS THE CLAIMANT (specific court arguments)
7. HOW THE RESPONDENT MAY USE THIS (anticipate counter-arguments)
8. SUGGESTED EXHIBIT REFERENCE (if none assigned)

Be specific, forensic, and analytical. Cite legal principles where relevant (EA 2010, ERA 1996).`,

    contradictions: `You are a forensic legal analyst. Your ONLY task is to find contradictions.

${caseContext}

DOCUMENT TEXT:
${text}

Find every contradiction between this document and:
1. Known case facts (listed in context above)
2. Logical impossibilities or improbabilities
3. Statements inconsistent with other evidence
4. The ANCHOR LIE pattern (statements not corrected at the time)

For each contradiction: state what Document A says vs what Document B (or known fact) says. Rate severity (Critical/Major/Minor).`,

    timeline: `Extract ALL dates from this document.

DOCUMENT TEXT:
${text}

For each date found:
1. The exact date (DD Month YYYY format)
2. What event occurred on that date
3. Why it matters to the case
4. Category: event/document/hearing/complaint/response/misconduct

Return as a structured list. Only include actual dates mentioned in the document.`,

    questions: `You are a barrister preparing cross-examination questions.

${caseContext}

DOCUMENT TEXT:
${text}

Generate precise cross-examination questions to put to the document's author or the party relying on it. Questions should:
1. Expose contradictions with the anchor lie
2. Force admissions about suppressed documents
3. Address the spoliation issue (if Aldi case)
4. Be in proper cross-examination form (leading, closed questions)

Label each question: Foundation / Confrontation / Admission / Closing`,
  };

  const system = `You are an expert forensic legal analyst specialising in UK employment tribunal and civil court cases. You analyse documents with precision and identify inconsistencies, anchor lies, and contradictions that can be used in court. Always be specific and cite document text directly.`;

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5-20251101',
        max_tokens: 2000,
        system,
        messages: [{ role: 'user', content: prompts[analysisType] || prompts.full }],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      return res.status(anthropicRes.status).json({ error: err });
    }

    const data = await anthropicRes.json();
    const analysis = data.content?.[0]?.text || '';

    if (evidenceId && caseId) {
      await supabase.from('my_evidence').update({
        ai_analysis: analysis,
      }).eq('id', evidenceId);
    }

    return res.status(200).json({ analysis, analysisType });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
