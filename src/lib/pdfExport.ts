// Truth-Layer PDF Report Generator
// Generates court-ready PDF reports for UJRIS

export interface CaseData {
  id: string;
  claimant: string;
  respondent: string;
  caseType: string;
  hearingDate?: string;
}

export interface AnalysisData {
  contradictions: Array<{
    type: string;
    statement1: string;
    statement2: string;
    evidence: string;
    confidence: number;
  }>;
  forensic: Array<{
    issue: string;
    details: string;
    recommendation: string;
  }>;
  vento: {
    lower: string;
    middle: string;
    upper: string;
    recommended: string;
  };
}

export class PDFExport {
  static generateHTMLReport(caseData: CaseData, analysis: AnalysisData): string {
    const now = new Date().toLocaleString('en-GB');
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>UJRIS Truth-Layer Report</title>
  <style>
    @page { margin: 2cm; }
    body { font-family: 'Times New Roman', serif; line-height: 1.6; color: #333; }
    .header { text-align: center; border-bottom: 3px solid #D4AF37; padding-bottom: 20px; margin-bottom: 30px; }
    .title { color: #0F2C4A; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
    .subtitle { color: #64748B; font-size: 14px; }
    .section { margin-bottom: 30px; page-break-inside: avoid; }
    .section-title { background: #0F2C4A; color: white; padding: 10px 15px; font-size: 18px; margin-bottom: 15px; }
    .finding { border-left: 4px solid #D4AF37; padding: 10px 15px; margin: 10px 0; background: #F8F1E9; }
    .finding-type { font-weight: bold; color: #0F2C4A; }
    .evidence { font-style: italic; color: #64748B; margin-top: 5px; }
    .confidence { float: right; background: #D4AF37; color: #0F2C4A; padding: 2px 8px; border-radius: 3px; font-size: 12px; }
    .vento-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .vento-table th, .vento-table td { border: 1px solid #EDE4D9; padding: 8px 12px; text-align: left; }
    .vento-table th { background: #0F2C4A; color: white; }
    .recommended { background: #D4AF37; font-weight: bold; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #EDE4D9; font-size: 12px; color: #64748B; }
    .legal-notice { background: #0F2C4A; color: white; padding: 15px; margin-top: 30px; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">UJRIS Truth-Layer Report™</div>
    <div class="subtitle">AI-Powered Forensic Analysis Report</div>
    <div class="subtitle">Generated: ${now}</div>
  </div>

  <div class="section">
    <div class="section-title">Case Summary</div>
    <table style="width: 100%;">
      <tr><td style="width: 150px; font-weight: bold;">Case ID:</td><td>${caseData.id}</td></tr>
      <tr><td style="font-weight: bold;">Claimant:</td><td>${caseData.claimant}</td></tr>
      <tr><td style="font-weight: bold;">Respondent:</td><td>${caseData.respondent}</td></tr>
      <tr><td style="font-weight: bold;">Case Type:</td><td>${caseData.caseType}</td></tr>
      ${caseData.hearingDate ? `<tr><td style="font-weight: bold;">Hearing Date:</td><td>${caseData.hearingDate} (${Math.ceil((new Date(caseData.hearingDate).getTime() - new Date().getTime()) / (1000*60*60*24))} days remaining)</td></tr>` : ''}
    </table>
  </div>

  <div class="section">
    <div class="section-title">Anchor Lie Detection™ — Contradictions Found</div>
    ${analysis.contradictions.map(c => `
      <div class="finding">
        <span class="confidence">${c.confidence}% Confidence</span>
        <div class="finding-type">${c.type}</div>
        <div><strong>Statement 1:</strong> ${c.statement1}</div>
        <div><strong>Statement 2:</strong> ${c.statement2}</div>
        <div class="evidence">Evidence: ${c.evidence}</div>
      </div>
    `).join('')}
  </div>

  <div class="section">
    <div class="section-title">Forensic Findings</div>
    ${analysis.forensic.map(f => `
      <div class="finding">
        <div class="finding-type">${f.issue}</div>
        <div>${f.details}</div>
        <div style="margin-top: 8px; padding: 8px; background: #D4AF37; color: #0F2C4A;">
          <strong>Recommendation:</strong> ${f.recommendation}
        </div>
      </div>
    `).join('')}
  </div>

  <div class="section">
    <div class="section-title">Vento Compensation Assessment</div>
    <table class="vento-table">
      <tr>
        <th>Band</th>
        <th>Range</th>
        <th>Assessment</th>
      </tr>
      <tr ${analysis.vento.recommended === 'Lower Band' ? 'class="recommended"' : ''}>
        <td>Lower Band</td>
        <td>£1,200 — £11,700</td>
        <td>${analysis.vento.lower}</td>
      </tr>
      <tr ${analysis.vento.recommended === 'Middle Band' ? 'class="recommended"' : ''}>
        <td>Middle Band</td>
        <td>£11,700 — £35,100</td>
        <td>${analysis.vento.middle}</td>
      </tr>
      <tr ${analysis.vento.recommended === 'Upper Band' ? 'class="recommended"' : ''}>
        <td>Upper Band</td>
        <td>£35,100 — £56,000</td>
        <td>${analysis.vento.upper}</td>
      </tr>
    </table>
    <p><strong>Recommended Claim: ${analysis.vento.recommended}</strong></p>
  </div>

  <div class="legal-notice">
    <p><strong>⚖️ Legal Notice:</strong> This report is generated by UJRIS as a decision-support tool, not legal advice. 
    For complex legal matters, consult a qualified solicitor or barrister.</p>
    <p>© 2026 UJU GROUP LIMITED. ALL RIGHTS RESERVED. UJRIS™ is a trademark of UJU GROUP LIMITED.</p>
    <p>Computer Misuse Act 1990 • Data Protection Act 2018 • Equality Act 2010</p>
  </div>

  <div class="footer">
    <p>UJRIS — Justice Shouldn't Require a Lawyer to Survive</p>
    <p>Generated by UJRIS Truth-Layer Reports™ | ${now}</p>
  </div>
</body>
</html>
    `.trim();
  }

  static downloadReport(caseData: CaseData, analysis: AnalysisData): void {
    const html = this.generateHTMLReport(caseData, analysis);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UJRIS_TruthLayer_Report_${caseData.id}_${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
