import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const UJRIS_SYSTEM = `You are UJRIS, an expert AI legal companion. You assist self-represented litigants in the UK, US, Canada, Australia, EU, India, and Nigeria.

RULES:
- Always state the jurisdiction you are advising on
- Cite verbatim case law and statutory references — never paraphrase without the citation
- Flag when advice differs between jurisdictions
- Never hallucinate case names or statute numbers — if unsure, say "I cannot verify this citation — please confirm via Westlaw or BAILII"
- Identify contradictions in the user's evidence or timeline
- Proactively suggest next actions, deadlines, and missing evidence
- Maintain strict confidentiality — never share case details outside this session
- Use plain language — explain legal jargon immediately after using it

FORMAT:
- Use numbered steps for procedures
- Use bullet points for evidence requirements
- Use bold for case citations and statute references
- Conclude each response with: "⚠️ UJRIS provides information only, not legal advice. For complex matters, consult a qualified solicitor."`;

export async function streamLegalResponse(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  jurisdiction: string,
  caseContext?: string
) {
  const systemPrompt = caseContext
    ? `${UJRIS_SYSTEM}\n\nJURISDICTION: ${jurisdiction}\n\nCASE CONTEXT:\n${caseContext}`
    : `${UJRIS_SYSTEM}\n\nJURISDICTION: ${jurisdiction}`;

  return anthropic.messages.stream({
    model: "claude-opus-4-5",
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  });
}

export async function generateFormContent(
  formType: string,
  jurisdiction: string,
  facts: Record<string, string>
): Promise<string> {
  const msg = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 8192,
    system: `You are a legal document drafter. Generate a complete, court-ready ${formType} for ${jurisdiction} jurisdiction using the provided facts. Use formal legal language. Include all required sections. Do not add placeholders — if information is missing, note it clearly.`,
    messages: [{ role: "user", content: `Generate the document using these facts:\n${JSON.stringify(facts, null, 2)}` }],
  });
  return (msg.content[0] as { text: string }).text;
}

export async function detectContradictions(timeline: string[]): Promise<string> {
  const msg = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 2048,
    system: "You are a legal analyst. Identify factual contradictions, implausible timelines, and evidential gaps in the provided case chronology. Be precise and cite specific entries.",
    messages: [{ role: "user", content: `Analyse this case timeline:\n${timeline.map((e, i) => `${i + 1}. ${e}`).join("\n")}` }],
  });
  return (msg.content[0] as { text: string }).text;
}

export async function generateLegalResearch(query: string, jurisdiction: string): Promise<{
  analysis: string;
  citations: Array<{ name: string; citation: string; court: string; year: string; relevance: string }>;
  strategy: string;
}> {
  const msg = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 4096,
    system: `${UJRIS_SYSTEM}\n\nJURISDICTION: ${jurisdiction}\n\nReturn your response as valid JSON matching this schema: { "analysis": "string", "citations": [{ "name": "string", "citation": "string", "court": "string", "year": "string", "relevance": "string" }], "strategy": "string" }`,
    messages: [{ role: "user", content: query }],
  });
  try {
    const text = (msg.content[0] as { text: string }).text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { analysis: text, citations: [], strategy: "" };
  } catch {
    return { analysis: (msg.content[0] as { text: string }).text, citations: [], strategy: "" };
  }
}
