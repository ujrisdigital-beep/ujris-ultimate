/**
 * educationalContent.js
 * ──────────────────────
 * Complete educational content library for UJRIS
 * Sources: GOV.UK, ACAS, EHRC, ICO, ONS, Charity resources
 * All materials used for educational purposes under Open Government Licence v3.0
 * and charitable fair use provisions
 */

export const educationalContent = {
  // ============================================
  // SECTION: JUSTICE GAP STATISTICS
  // ============================================
  justiceGap: {
    title: '📊 The UK Justice Gap – By the Numbers',
    source: 'Ministry of Justice, House of Commons Library, LawtechUK',
    lastUpdated: 'March 2026',
    level: 'All',
    icon: '📈',
    modules: [
      {
        id: 'gap-01',
        title: 'The Scale of the Problem',
        content: `
🔹 70,000+ self-represented litigants face discrimination claims annually in the UK
   Source: Ministry of Justice Tribunal Statistics (2025/26)

🔹 14% win rate for self-represented claimants vs 48% with legal representation
   Source: Ministry of Justice Analysis (2025)
   Impact: Self-reps are 3.4× less likely to succeed

🔹 515,000 open Employment Tribunal claims – a 49% increase in single-claim backlog
   Source: MoJ Q3 2025/26
   Waiting time: Average 25+ weeks for hearing (up to 37+ for discrimination)

🔹 94% of BAME claimants lack legal representation
   Source: Legal Action Group / EHRC (2025)

🔹 Disability discrimination claims up 80% over five years
   Source: EHRC (2025)

🔹 Race discrimination claims increased 60% year-on-year
   Source: MoJ (2025)

🔹 Sex discrimination claims rose 65% in the past year
   Source: MoJ (2025)

💡 Why UJRIS Exists: The system is collapsing under volume. Self-reps need better tools.
        `,
      },
    ],
  },

  // ============================================
  // SECTION: EQUALITY ACT 2010
  // ============================================
  equalityAct2010: {
    title: '⚖️ Equality Act 2010 – Your Protected Rights',
    source: 'EHRC, GOV.UK',
    lastUpdated: 'April 2025',
    level: 'Beginner',
    icon: '🛡️',
    modules: [
      {
        id: 'ea-01',
        title: 'The 9 Protected Characteristics',
        content: `
The Equality Act 2010 protects you from discrimination based on:

🔹 Age – You cannot be treated unfairly because of your age
   Example: "We're not hiring people over 50"

🔹 Disability – Physical or mental impairment with substantial long-term effect
   Example: Employer refuses reasonable adjustments for ADHD

🔹 Gender Reassignment – Transgender, non-binary, or transitioning
   Example: Harassment or exclusion based on transition status

🔹 Marriage & Civil Partnership – Being married or in a civil partnership
   Example: "Married people don't work as hard"

🔹 Pregnancy & Maternity – Pregnancy, childbirth, breastfeeding
   Example: Dismissal or demotion due to pregnancy

🔹 Race – Colour, nationality, ethnic or national origins
   Example: Racial slurs, hiring only white people

🔹 Religion or Belief – Any religion, belief, or lack thereof
   Example: Refusing prayer breaks or religious dress

🔹 Sex – Being male, female, or non-binary
   Example: Sexism, gender-based pay gaps, sexual harassment

🔹 Sexual Orientation – Gay, lesbian, bisexual, heterosexual
   Example: Homophobic jokes, exclusion from team events

💡 Key Insight: You don't need to prove intention to discriminate. Only that the treatment happened BECAUSE of a protected characteristic.
        `,
      },
      {
        id: 'ea-02',
        title: 'Types of Discrimination',
        content: `
⚖️ DIRECT DISCRIMINATION (Section 13)
Treating someone less favourably BECAUSE of a protected characteristic.
Example: "We're not hiring you because you're too old"
Burden of Proof: You must show a comparator (someone without your characteristic who was treated better)

🔄 INDIRECT DISCRIMINATION (Section 19)
A policy that applies equally but has a disparate impact on a protected group.
Example: "All employees must work Saturdays" – disproportionately affects those with religious observance
Legal Test: Is it a provision, criterion, or practice? Does it put you at disadvantage? Is it justified?

🚫 HARASSMENT (Section 26)
Unwanted conduct related to a protected characteristic that violates dignity or creates an intimidating environment.
Example: Persistent jokes about your accent, unwanted touching, offensive language
Key: Even one serious incident can amount to harassment

⚠️ VICTIMISATION (Section 27)
Treating someone badly BECAUSE they've made a discrimination complaint.
Example: Being dismissed, demoted, or ostracized after raising a grievance
Protection: Applies whether the original complaint was successful or not

🚫 FAILING TO MAKE REASONABLE ADJUSTMENTS (Section 21)
Not providing the help someone needs to participate equally (disability discrimination).
Example: Not providing screen reader software for a blind employee
Test: Is adjustment reasonable? Does it cause substantial disadvantage? Is it practical?
        `,
      },
      {
        id: 'ea-03',
        title: 'Direct vs Indirect: The Comparator',
        content: `
🎯 THE COMPARATOR TEST FOR DIRECT DISCRIMINATION

To prove direct discrimination, you need to show someone in the same circumstances was treated better.

🔹 ACTUAL COMPARATOR
A real person who:
- Was in the same role / job group
- Had the same manager / decision-maker
- Faced the same situation
- But was treated more favourably
Example: Male colleague did identical job but was paid £5k more

🔹 HYPOTHETICAL COMPARATOR
If no actual comparator exists, ask: "How would someone without my characteristic have been treated?"
Example: Only person with a disability in your department, so use hypothetical comparator standard

💡 UJRIS Tool: Use our Comparator Intelligence Module to identify and validate your comparator.

⚠️ Common Mistake: "They treated me badly" ≠ Discrimination. Must show differential treatment.
        `,
      },
    ],
  },

  // ============================================
  // SECTION: EVIDENCE & FORENSICS
  // ============================================
  evidence: {
    title: '📁 Evidence – The Key to Winning',
    source: 'UJRIS, EHRC, ACAS',
    lastUpdated: 'March 2026',
    level: 'Intermediate',
    icon: '🔍',
    modules: [
      {
        id: 'ev-01',
        title: 'Subject Access Request (SAR) – Your Superpower',
        content: `
📋 YOUR RIGHT UNDER UK GDPR ARTICLE 15

A Subject Access Request forces your employer to provide ALL personal data they hold about you.
This is often the most powerful evidence you can gather.

WHAT YOU CAN REQUEST:
✅ All emails mentioning your name or ID
✅ Meeting notes and minutes (especially team meetings)
✅ Performance reviews and disciplinary records
✅ Diversity/monitoring data (age, race, gender, disability status)
✅ CCTV footage featuring you
✅ WhatsApp, Teams, Slack messages involving you
✅ Communications between management about you
✅ Anything else they hold about you

⏰ TIMELINE:
- Must be responded to within 30 calendar days
- Can only extend by 60 days if "complex"
- If they miss deadline: complain to ICO

🚫 WHAT THEY CAN'T DO:
- Charge a fee (unless manifestly unfounded)
- Delete records after your request
- Withhold data without a valid exemption
- Give you a version with evidence "cleaned up"

💡 PRO TIP: Send your SAR immediately when a dispute arises. Data could be deleted.

💡 UJRIS Tool: Use our SAR Generator to create a professional request instantly.
        `,
      },
      {
        id: 'ev-02',
        title: 'Anchor Lie Detection',
        content: `
🏛️ THE FOUNDATIONAL FALSEHOOD

An "Anchor Lie" is the single pivotal false statement upon which an entire employer defence depends.
Disprove it, and the whole case collapses.

🔍 HOW TO SPOT AN ANCHOR LIE:

1. Listen for "The Story" – Employer tells a coherent narrative
   Example: "We dismissed for performance issues"

2. Look for the Anchor – One statement everything else relies on
   Example: "She had missed 3 deadlines"

3. Test Against Evidence
   - Do emails contradict this?
   - Does CCTV show the opposite?
   - Do witness statements dispute it?
   - Is there a timing problem (they said X happened on Day A, but email from Day B disproves it)?

4. Spot Language Shifts
   - Specific → Vague (they describe some incidents in detail, others vaguely)
   - Active → Passive ("I made a decision" vs "The decision was made")
   - Certain → Qualified ("She was lazy" vs "to the best of my knowledge, she seemed")

REAL EXAMPLE:
Anchor Lie: "Employee's performance declined sharply between April-June 2025"
Counter-Evidence: Appraisal dated June 2025 rates performance as "Exceeds Expectations"
Result: Not just a lie, but an ANCHOR LIE. Everything after depends on this being true.

💡 UJRIS Tool: Our Forensic Auditor identifies Anchor Lies automatically using NLP.
        `,
      },
    ],
  },

  // ============================================
  // SECTION: EMPLOYMENT TRIBUNAL PROCESS
  // ============================================
  tribunalProcess: {
    title: '🏛️ Employment Tribunal Process – Step by Step',
    source: 'ACAS, Ministry of Justice, GOV.UK',
    lastUpdated: 'April 2025',
    level: 'Intermediate',
    icon: '⚖️',
    modules: [
      {
        id: 'tr-01',
        title: 'The 3-Month Rule – Your Most Critical Deadline',
        content: `
⏰ CRITICAL: You have 3 MONTHS MINUS 1 DAY from the act of discrimination

Example:
- Discrimination happened: 1 March 2026
- Deadline to file: 31 May 2026
- After 31 May: Too late (tribunal will reject your claim)

⚠️ BUT THERE ARE EXTENSIONS:

1. CONTINUING ACT
If discrimination happened repeatedly, the 3-month clock runs from the LAST act.
Example:
- First incident: January 2026
- Second incident: April 2026
- Deadline: 31 July 2026 (3 months from April)

2. ACAS EARLY CONCILIATION
Timeline pauses while ACAS tries to settle.
Example:
- Dispute arises: January
- You notify ACAS: January 15
- ACAS works for 3 months
- You have 1 month after ACAS certificate to file

3. DISCRIMINATION "COURSE OF CONDUCT"
If discrimination is part of a pattern, tribunal may treat it as a single act.
Example:
- Pattern of racial comments from January–September
- Could be treated as one act, so 3-month clock runs from September

⚠️ ACAS EARLY CONCILIATION IS MANDATORY
You cannot file a tribunal claim until you've notified ACAS
Process: Complete EC form → ACAS contacts employer → 3-month attempt to settle → Get EC certificate

💡 UJRIS Tool: Your dashboard shows your deadline countdown with traffic light warning.
Set reminders at 2 months, 1 month, 2 weeks, 1 week.
        `,
      },
      {
        id: 'tr-02',
        title: 'ACAS Early Conciliation – What to Expect',
        content: `
🤝 BEFORE YOU CAN FILE: YOU MUST TRY TO SETTLE WITH ACAS

Process:
1. Complete the ACAS Early Conciliation (EC) form online
2. ACAS notifies your employer and proposes a settlement discussion
3. ACAS will contact both parties (you and employer) separately
4. They explore what you want and what employer might offer
5. If NO settlement after 3 months, you get an Early Conciliation Certificate
6. You then have 1 month to file your Employment Tribunal claim

Key Points:
- You do NOT have to accept any offer
- ACAS won't tell your employer what you want (confidential)
- Anything said at ACAS cannot be used as evidence in tribunal
- If employer makes an offer, you can think about it for 21 days after EC ends

⏰ Timeline:
- Notify ACAS: Day 1
- ACAS works: Days 1–90+
- Get EC Certificate: Day 90
- File ET1 claim: Within 1 month of certificate (deadline is THIS date, not original 3-month date)

💡 UJRIS Tool: Use our ACAS Strategy Bot to prepare your opening statement and valuation.
        `,
      },
      {
        id: 'tr-03',
        title: 'Filing Your ET1 Claim',
        content: `
📋 THE CLAIM FORM

After ACAS Early Conciliation, you'll file the ET1 (Employment Tribunal 1) form.

WHAT TO INCLUDE:
1. Your details (name, address, contact)
2. Employer details (name, address, headquarters)
3. Type of claim (discrimination, racial harassment, etc.)
4. Details of the claim:
   - What happened (brief narrative)
   - When it happened
   - Why you believe it's discrimination
   - What you're asking for (compensation, re-instatement, reference correction)
5. Supporting evidence (list key documents)

⚠️ CRITICAL MISTAKES TO AVOID:
❌ Being too detailed or emotional (stick to facts)
❌ Raising new claims not mentioned to ACAS (they may be rejected)
❌ Not quantifying your loss (claims for damages must have figures)
❌ Missing the deadline (tribunal auto-rejects late claims unless exceptional circumstance)

✅ STRONG ET1:
- Clear, dated narrative
- Specific dates and names
- Legal references (Equality Act Section 13 for direct discrimination)
- Realistic damages claim with breakdown
- Key documents listed

💡 UJRIS Tool: Our ET1 Generator creates tribunal-ready forms.
        `,
      },
    ],
  },

  // ============================================
  // SECTION: VENTO BANDS & COMPENSATION
  // ============================================
  ventoBands: {
    title: '💰 Vento Bands – What Your Case is Worth',
    source: 'Judicial College, Employment Tribunals',
    lastUpdated: 'April 2025',
    level: 'Intermediate',
    icon: '💷',
    modules: [
      {
        id: 'vento-01',
        title: 'Vento 2026 – Injury to Feelings',
        content: `
💷 COMPENSATION TIERS FOR PSYCHOLOGICAL HARM

Injury to Feelings is the main award in discrimination cases. It's based on how the treatment affected you emotionally.

🔹 LOWER BAND: £1,200 – £12,100
Isolated incidents or one-off acts with minimal lasting impact.
Examples:
- Single discriminatory comment (not repeated)
- One incident of unfair treatment
- Limited emotional impact (no medical evidence)
Award: Typically £4,000–£7,000

🔸 MIDDLE BAND: £12,100 – £36,400
Sustained harassment or significant psychological impact.
Examples:
- Ongoing bullying over several months
- Consistent unfair treatment
- GP-certified stress or anxiety
- Loss of career progression
Award: Typically £15,000–£25,000

🔺 UPPER BAND: £36,400 – £60,700
Most serious cases with extended campaigns or severe impact.
Examples:
- Years of discrimination causing permanent career damage
- Clinical depression or psychological injury
- Complete loss of livelihood
- Severe reputational damage
Award: Typically £40,000–£55,000

🔴 EXCEPTIONAL: Exceeds £60,700
Very rare cases with aggravated damages or extreme circumstances.
Example: Physical assault, multiple breaches of statutory duty combined

MULTIPLIERS (Make Awards Higher):

1. Aggravated Damages
   If employer's conduct was malicious or deliberate
   Example: Lying in tribunal, continuing discrimination after complaint
   Can add: £3,000–£10,000 (or higher in egregious cases)

2. Loss of Earnings
   If you were dismissed or forced to leave
   Calculation: (Monthly salary ÷ 30) × Days unemployed
   Added on TOP of Vento

3. Pension Shortfall
   If you left with fewer years of service
   Calculation: (Loss per year × Years remaining to retirement) × Discount factor
   Added on TOP of Vento

4. Future Loss / Loss of Opportunity
   If discrimination harmed career prospects
   Added on TOP of Vento

💡 UJRIS Tool: Our Vento Estimator calculates YOUR potential award based on evidence.
        `,
      },
    ],
  },

  // ============================================
  // SECTION: DOMESTIC ABUSE
  // ============================================
  domesticAbuse: {
    title: '🛡️ Domestic Abuse – Official Statistics & Support',
    source: 'Office for National Statistics, Refuge, Women\'s Aid',
    lastUpdated: 'March 2026',
    level: 'Beginner',
    icon: '❤️',
    modules: [
      {
        id: 'da-01',
        title: 'By the Numbers',
        content: `
📊 KEY STATISTICS (2024/25):

🔹 3.8 million adults aged 16+ experienced domestic abuse in the year ending March 2025
   - 2.2 million women
   - 1.5 million men
   Source: Office for National Statistics (ONS)

🔹 Police receive a domestic abuse-related call every 30 seconds (England & Wales)
   Source: ONS

🔹 Fewer than 20% of domestic abuse incidents are ever reported to police
   Source: ONS / Crime Survey for England and Wales

🔹 1 in 4 women will experience domestic abuse in their lifetime
   1 in 6 men will experience it
   Source: ONS

💡 SUPPORT AVAILABLE:
📞 National Domestic Abuse Helpline: 0808 2000 247 (24/7, FREE, confidential)
📞 Men's Advice Line: 0808 801 0327
📞 Respect Phoneline: 0808 802 4040
        `,
      },
      {
        id: 'da-02',
        title: 'Coercive Control – The Invisible Abuse',
        content: `
🔗 COERCIVE CONTROL IS A CRIME

Coercive control is a pattern of behaviour designed to isolate, intimidate, and control.
It is a CRIMINAL OFFENCE under Section 76 of the Serious Crime Act 2015.

SIGNS INCLUDE:
- Constant monitoring of your movements (following, tracking via phone)
- Restricting access to money ("I control finances")
- Isolating you from friends and family
- Gaslighting (making you doubt your reality: "That never happened")
- Threats to harm you, children, or themselves
- Using technology to control or spy (spyware, location tracking)
- Constant criticism and belittling
- Controlling what you wear, where you go, who you see
- Forcing you to ask permission for basic things
- Preventing you from working or controlling your job

ImpACT:
- Victims often don't recognize it as abuse
- Cumulative effect is more damaging than single incidents
- Leads to severe psychological injury (PTSD, anxiety, depression)

🏛️ LEGAL ROUTE:
- Criminal: Report to police → CPS prosecution
- Family Court: Non-molestation order, occupation order
- Tribunal: If workplace-related, discrimination claim under Equality Act

💡 UJRIS Tool: Our Coercive Control Detector helps you document patterns over time.
        `,
      },
    ],
  },

  // ============================================
  // SECTION: MODERN SLAVERY
  // ============================================
  modernSlavery: {
    title: '🚨 Modern Slavery & Human Trafficking',
    source: 'Home Office, Unseen UK, Modern Slavery Helpline',
    lastUpdated: 'March 2026',
    level: 'Beginner',
    icon: '🛑',
    modules: [
      {
        id: 'ms-01',
        title: 'The Statistics & How to Get Help',
        content: `
📊 SCALE OF THE PROBLEM:

🔹 23,411 potential victims referred to the National Referral Mechanism (NRM) in 2025
   – a 22% increase from 2024
   Source: Home Office NRM Statistics (2025)

🔹 Only 66% of NRM cases result in a positive finding of modern slavery
   – victims often lack forensic proof of their exploitation
   Source: Home Office (2025)

🔹 NRM backlog: 5,758 cases waiting for assessment
   Source: Home Office (2025)

TYPES OF MODERN SLAVERY:
✋ Labour exploitation (forced work, debt bondage)
✊ Sexual exploitation (prostitution, trafficking)
🏠 Domestic servitude (forced household work)
👶 Child labour and child sexual exploitation

SIGNS:
- Constant working, no days off
- Living with employer, no freedom of movement
- Not being paid or paid very little
- Passport/ID documents taken
- Not allowed to leave
- Signs of physical abuse

📞 IMMEDIATE HELP:
Modern Slavery Helpline: 08000 121 700 (24/7, confidential)
Unseen UK: www.unseenuk.org
Salvation Army: 0800 808 3733

💡 UJRIS Tool: Use our Anonymous Mode to safely document exploitation without immediate risk.
        `,
      },
    ],
  },

  // ============================================
  // SECTION: POLICE & INSTITUTIONAL ACCOUNTABILITY
  // ============================================
  policeAccountability: {
    title: '👮 Police Misconduct & Your Rights',
    source: 'IOPC, Home Office, Victims\' Commissioner',
    lastUpdated: 'March 2026',
    level: 'Advanced',
    icon: '🚔',
    modules: [
      {
        id: 'police-01',
        title: 'The Victims\' Code of Practice – Your Legal Rights',
        content: `
📋 YOUR RIGHTS WHEN REPORTING A CRIME

Under the Victims' Code of Practice (2020), you have legal entitlements:

✅ RIGHT 1: Information
- Be informed about case progress without unreasonable delay
- Get regular updates (usually every 6-8 weeks)
- Know outcome of investigation

✅ RIGHT 2: Consultation
- Be consulted before key decisions (e.g., "No Further Action")
- Your views considered in deciding whether to charge

✅ RIGHT 3: Safety Assessment
- Police assess your safety needs
- Support if at risk of retaliation

✅ RIGHT 4: Review & Complaint
- Request a review of any "No Further Action" decision
- Escalate to police force complaints team
- Escalate to Independent Office for Police Conduct (IOPC)

✅ RIGHT 5: Enhanced Support (if vulnerable victim)
- Special measures if you're experiencing domestic abuse, sexual assault, etc.
- Dedicated officer
- Victim support services
- Court support if case proceeds

⚠️ BREACHES OF THE VICTIMS' CODE:
If police breach your rights:
1. Complain to the police force (local level)
2. Escalate to IOPC if not satisfied
3. Potential compensation claim

💡 UJRIS Tool: Our Police Misconduct module tracks whether your rights have been upheld and generates IOPC complaints.
        `,
      },
    ],
  },
};

export default educationalContent;
