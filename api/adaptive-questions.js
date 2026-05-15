export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { caseType, employer, description } = await req.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
  }

  const prompt = `You are a legal assistant. Based on this case description, generate 3-5 follow-up questions that would help build a strong legal case.

Case type: ${caseType}
Employer: ${employer}
Description: ${description}

Return ONLY valid JSON in this exact format, no markdown or extra text:
{
  "followUpQuestions": [
    {
      "question": "Clear question text",
      "type": "textarea",
      "placeholder": "Optional placeholder text",
      "whyImportant": "Why this matters for the case"
    }
  ]
}

Use "select" type with "options" array when appropriate. Keep questions focused on evidence, witnesses, dates, and specific details needed for legal proceedings.`;

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
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      return new Response(JSON.stringify({ error: err }), {
        status: anthropicRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await anthropicRes.json();
    const content = data.content[0].text;

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(JSON.stringify({ followUpQuestions: [] }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(parsed), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('Error generating follow-up questions:', err);
    return new Response(JSON.stringify({ followUpQuestions: [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
