-- ============================================================
-- UJRIS Personal Case System – Migration 002
-- Two cases: Fairwinds (6016884/2025) + Aldi (770MC038)
-- ============================================================

-- Evidence files uploaded by user
CREATE TABLE IF NOT EXISTS my_evidence (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id       TEXT NOT NULL CHECK (case_id IN ('fairwinds','aldi')),
  title         TEXT NOT NULL,
  description   TEXT,
  document_date DATE,
  exhibit_ref   TEXT,
  key_points    TEXT[],
  raw_text      TEXT,
  storage_path  TEXT,
  file_type     TEXT,
  is_key        BOOLEAN DEFAULT FALSE,
  is_anchor_lie BOOLEAN DEFAULT FALSE,
  anchor_lie_detail TEXT,
  ai_analysis   TEXT,
  contradictions TEXT[],
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_evidence_case ON my_evidence(case_id);
CREATE INDEX idx_evidence_key ON my_evidence(is_key);

ALTER TABLE my_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Single user access" ON my_evidence FOR ALL USING (TRUE);

-- Timeline events (automatically extracted + manually entered)
CREATE TABLE IF NOT EXISTS timeline_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id       TEXT NOT NULL CHECK (case_id IN ('fairwinds','aldi')),
  event_date    DATE NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  evidence_id   UUID REFERENCES my_evidence(id) ON DELETE SET NULL,
  is_key_event  BOOLEAN DEFAULT FALSE,
  category      TEXT DEFAULT 'event' CHECK (category IN ('event','document','hearing','complaint','response','misconduct')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timeline_case ON timeline_events(case_id);
CREATE INDEX idx_timeline_date ON timeline_events(event_date);

ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Single user timeline" ON timeline_events FOR ALL USING (TRUE);

-- ============================================================
-- SEED: ALDI CASE (770MC038) – HEARING 5 MAY 2026 (URGENT)
-- ============================================================
INSERT INTO my_evidence (case_id, title, exhibit_ref, document_date, is_key, description, key_points) VALUES
('aldi', 'CCTV Footage – Exhibit OO-1', 'OO-1', '2025-12-03', TRUE,
 'CCTV footage from Aldi store on 3 December 2025. Directly disproves the false "wheel basket" report by security personnel.',
 ARRAY['No wheel basket incident visible', 'Directly contradicts security report', 'Key exculpatory evidence']),
('aldi', 'N244 Application', NULL, '2026-03-01', TRUE,
 'Application notice N244 filed with the County Court.',
 ARRAY['Application filed', 'Court proceedings initiated']),
('aldi', 'Police Complaint CO/0006726', 'CO/0006726', '2025-12-15', TRUE,
 'Formal police complaint regarding conduct during the 3 December 2025 incident. Collusion alleged.',
 ARRAY['Police complaint filed', 'Reference CO/0006726', 'Alleges police collusion']),
('aldi', 'SYP SAR Response – Dashcam Footage Lost', NULL, '2026-01-15', TRUE,
 'South Yorkshire Police SAR response confirming dashcam footage from 3 December 2025 incident has been "lost". This constitutes spoliation of evidence.',
 ARRAY['SPOLIATION of evidence', 'Dashcam footage destroyed/lost', 'SYP admits footage unavailable', 'Adverse inference should be drawn']);

INSERT INTO timeline_events (case_id, event_date, title, description, is_key_event, category) VALUES
('aldi', '2025-12-03', 'INCIDENT AT ALDI STORE', 'Claimant (Onyedika Ojiaku) attended Aldi store. ASEL Security Ltd personnel falsely reported a "wheel basket" incident. Claimant was subjected to detention and assault. South Yorkshire Police attended and allegedly colluded with security personnel.', TRUE, 'event'),
('aldi', '2025-12-03', 'Police Attend – Alleged Collusion', 'South Yorkshire Police (SYP) attended Aldi store. Claimant alleges police colluded with ASEL Security Ltd against claimant. Police dashcam footage was recording.', TRUE, 'event'),
('aldi', '2025-12-15', 'Police Complaint Filed – CO/0006726', 'Formal complaint filed against South Yorkshire Police. Reference: CO/0006726. Alleges misconduct and collusion with Aldi/ASEL.', TRUE, 'complaint'),
('aldi', '2026-01-15', 'SYP SAR Response – Dashcam "Lost"', 'SYP respond to Subject Access Request confirming dashcam footage from 3 December 2025 has been lost. This is spoliation of evidence. Court should draw adverse inference.', TRUE, 'misconduct'),
('aldi', '2026-03-01', 'N244 Application Filed', 'Application Notice N244 filed with County Court for claim 770MC038.', TRUE, 'document'),
('aldi', '2026-05-05', 'COUNTY COURT HEARING – 770MC038', 'Hearing date for County Court claim 770MC038 against Aldi Stores Ltd, ASEL Security Ltd, and South Yorkshire Police.', TRUE, 'hearing');

-- ============================================================
-- SEED: FAIRWINDS CASE (6016884/2025) – HEARING 22 JULY 2026
-- ============================================================
INSERT INTO my_evidence (case_id, title, exhibit_ref, document_date, is_key, is_anchor_lie, anchor_lie_detail, description, key_points) VALUES
('fairwinds', '2 May 2024 Investigation Notes – THE ANCHOR LIE', NULL, '2024-05-02', TRUE, TRUE,
 'At the 2 May 2024 meeting, claimant stated "No supervisions until now." The manager did NOT correct this statement at the time – creating the anchor lie. Later, employer tried to claim supervisions had occurred.',
 'Investigation meeting notes. Claimant says "No supervisions until now." Manager does not correct this statement. This is the ANCHOR LIE – an admission by conduct that no supervisions had occurred.',
 ARRAY['THE ANCHOR LIE: "No supervisions until now"', 'Manager did NOT correct the statement', 'Admission by silence/conduct', 'Establishes no supervisions occurred before this date']),
('fairwinds', '23 May 2024 Probation Review Notes – Suppressed Documents', NULL, '2024-05-23', TRUE, FALSE, NULL,
 'Probation review notes where 3 supervision documents were shown to claimant but then withheld. Documents shown but not disclosed constitutes suppression.',
 ARRAY['3 supervision documents shown but not provided', 'Documents withheld from claimant', 'Suppression of evidence', 'Contradicts later claim of full disclosure']),
('fairwinds', '6 May 2025 Pancott Letter – False Certification', NULL, '2025-05-06', TRUE, TRUE,
 'Letter from Pancott falsely certifying that all documents had been disclosed. This is provably false given the withheld supervision documents from 23 May 2024.',
 ARRAY['FALSE certification of disclosure', 'States "all documents disclosed"', 'Contradicted by withheld supervision records', 'Potential perverting course of justice']),
('fairwinds', '26 August 2025 Leaver Letter', NULL, '2025-08-26', TRUE, FALSE, NULL,
 'Leaver letter confirming employment continued until August 2025. This proves the timeline of employment and undermines any earlier dismissal narrative.',
 ARRAY['Employment continued until August 2025', 'Undermines employer narrative', 'Proves extended employment period']),
('fairwinds', '30 September 2025 Payroll Response', NULL, '2025-09-30', TRUE, FALSE, NULL,
 'Payroll confirms claimant was "processed from leaver portal." Provides evidence of employment status and payroll records.',
 ARRAY['Processed from leaver portal', 'Confirms employment timeline', 'Payroll evidence']),
('fairwinds', 'CQC Referral GFC-00014695', 'GFC-00014695', '2024-06-01', TRUE, FALSE, NULL,
 'CQC referral made regarding care standards concerns. Evidence of whistleblowing.',
 ARRAY['CQC referral', 'Protected disclosure', 'Whistleblowing evidence']),
('fairwinds', 'CQC Referral CAS-1302493-Y5Q2J3', 'CAS-1302493', '2024-07-01', TRUE, FALSE, NULL,
 'Second CQC referral. Continued whistleblowing activity.',
 ARRAY['Second CQC referral', 'Pattern of protected disclosures']),
('fairwinds', 'Action Fraud Report RF26020132538C', 'RF26020132538C', '2025-10-01', TRUE, FALSE, NULL,
 'Action Fraud report filed. Reference RF26020132538C.',
 ARRAY['Action Fraud reference RF26020132538C', 'Criminal conduct alleged', 'Fraud referral']);

INSERT INTO timeline_events (case_id, event_date, title, description, is_key_event, category) VALUES
('fairwinds', '2024-05-02', 'THE ANCHOR LIE – Investigation Meeting', 'Claimant states at investigation meeting: "No supervisions until now." Manager does NOT correct this statement. This is the anchor lie – an admission by conduct that no prior supervisions occurred. This single moment is the cornerstone of the fabrication case.', TRUE, 'event'),
('fairwinds', '2024-05-23', 'Probation Review – Documents Shown But Withheld', '3 supervision documents shown to claimant during probation review meeting but then withheld. This constitutes suppression of evidence and directly contradicts the anchor lie – if supervisions had occurred, why were documents only appearing now?', TRUE, 'misconduct'),
('fairwinds', '2024-06-01', 'CQC Referral GFC-00014695 – Protected Disclosure', 'First CQC referral made. This is a qualifying protected disclosure under ERA 1996 s.43B. Any subsequent detriment or dismissal is automatically connected to this disclosure.', TRUE, 'complaint'),
('fairwinds', '2025-05-06', 'Pancott Letter – False Certification of Disclosure', 'Letter from Pancott certifying "all documents disclosed." This is demonstrably false. The 3 supervision documents shown on 23 May 2024 were never formally provided. This letter is evidence of fraud/perverting the course of justice.', TRUE, 'misconduct'),
('fairwinds', '2025-08-26', 'Leaver Letter – Employment Confirmed Until August 2025', 'Leaver letter establishes employment continued until 26 August 2025. This is crucial for calculating the limitation period and for any unfair dismissal claim.', TRUE, 'document'),
('fairwinds', '2025-09-30', 'Payroll Response – "Processed from Leaver Portal"', 'Payroll department confirms claimant processed from leaver portal in September 2025. Corroborates employment timeline.', FALSE, 'response'),
('fairwinds', '2025-10-01', 'Action Fraud Report RF26020132538C', 'Action Fraud referral filed. Reference RF26020132538C.', TRUE, 'complaint'),
('fairwinds', '2026-07-22', 'EMPLOYMENT TRIBUNAL HEARING – 6016884/2025', 'Hearing date for Employment Tribunal claim against Fairwinds Health Care Ltd. Claims: Race discrimination, whistleblowing detriment, constructive unfair dismissal.', TRUE, 'hearing');
