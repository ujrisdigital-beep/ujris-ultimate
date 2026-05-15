-- ============================================================
-- UJRIS – Initial Database Migration
-- Platform: Supabase (PostgreSQL 15+)
-- Run in Supabase SQL Editor
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- 1. USER PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id                     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name           TEXT,
  subscription_tier      TEXT DEFAULT 'free'
                           CHECK (subscription_tier IN ('free','justice','sovereign','advocate')),
  subscription_active_until TIMESTAMPTZ,
  stripe_customer_id     TEXT,
  is_helper              BOOLEAN DEFAULT FALSE,
  is_admin               BOOLEAN DEFAULT FALSE,
  total_cases            INT DEFAULT 0,
  successful_cases       INT DEFAULT 0,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
  ON user_profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users insert own profile"
  ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 2. CASES
-- ============================================================
CREATE TABLE IF NOT EXISTS cases (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title                    TEXT NOT NULL,
  status                   TEXT DEFAULT 'active'
                             CHECK (status IN ('active','closed','settled','tribunal','withdrawn')),
  case_type                TEXT,
  protected_characteristics TEXT[],
  hearing_date             TIMESTAMPTZ,
  employer_name_enc        BYTEA,
  strength_score           INT DEFAULT 0 CHECK (strength_score BETWEEN 0 AND 100),
  estimated_value_min      INT DEFAULT 0,
  estimated_value_max      INT DEFAULT 0,
  outcome                  TEXT CHECK (outcome IN ('won','lost','settled','withdrawn',NULL)),
  settlement_amount        INT,
  is_anonymized            BOOLEAN DEFAULT FALSE,
  closed_at                TIMESTAMPTZ,
  pii_delete_at            TIMESTAMPTZ,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_cases_hearing_date ON cases(hearing_date);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users CRUD own cases"
  ON cases FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 3. EVIDENCE GRAPH – NODES
-- ============================================================
CREATE TABLE IF NOT EXISTS evidence_nodes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id         UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_type       TEXT NOT NULL
                    CHECK (node_type IN ('document','statement','date','witness','contradiction','claim','communication','policy')),
  title           TEXT NOT NULL,
  content         TEXT,
  metadata        JSONB DEFAULT '{}',
  source          TEXT,
  reliability_score INT DEFAULT 50 CHECK (reliability_score BETWEEN 0 AND 100),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_evidence_nodes_case ON evidence_nodes(case_id);

ALTER TABLE evidence_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users CRUD own nodes"
  ON evidence_nodes FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 4. EVIDENCE GRAPH – EDGES
-- ============================================================
CREATE TABLE IF NOT EXISTS evidence_edges (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id         UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  source_node_id  UUID NOT NULL REFERENCES evidence_nodes(id) ON DELETE CASCADE,
  target_node_id  UUID NOT NULL REFERENCES evidence_nodes(id) ON DELETE CASCADE,
  edge_type       TEXT NOT NULL
                    CHECK (edge_type IN ('contradicts','supports','references','involves','precedes','follows','corroborates')),
  weight          FLOAT DEFAULT 1.0 CHECK (weight BETWEEN 0 AND 1),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_evidence_edges_case ON evidence_edges(case_id);

ALTER TABLE evidence_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users CRUD own edges via case"
  ON evidence_edges FOR ALL
  USING (case_id IN (SELECT id FROM cases WHERE user_id = auth.uid()));

-- ============================================================
-- 5. SIMILAR CASES (Anonymized Outcome Database)
-- ============================================================
CREATE TABLE IF NOT EXISTS similar_cases (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_case_id     UUID REFERENCES cases(id) ON DELETE SET NULL,
  case_type            TEXT NOT NULL,
  protected_characteristics TEXT[],
  jurisdiction         TEXT DEFAULT 'UK',
  outcome              TEXT NOT NULL CHECK (outcome IN ('won','lost','settled','withdrawn')),
  settlement_amount    INT,
  strength_score       INT,
  key_factors          TEXT[],
  duration_days        INT,
  employer_size        TEXT CHECK (employer_size IN ('micro','small','medium','large','public_sector')),
  anonymized_summary   TEXT,
  legal_citation       TEXT,
  year                 INT,
  search_vector        TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(anonymized_summary,'') || ' ' ||
      coalesce(case_type,'') || ' ' ||
      coalesce(array_to_string(key_factors,' '),'') || ' ' ||
      coalesce(array_to_string(protected_characteristics,' '),'')
    )
  ) STORED,
  embedding            vector(1536),
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_similar_cases_search ON similar_cases USING GIN(search_vector);
CREATE INDEX idx_similar_cases_type ON similar_cases(case_type);
CREATE INDEX idx_similar_cases_outcome ON similar_cases(outcome);
CREATE INDEX IF NOT EXISTS idx_similar_cases_embedding
  ON similar_cases USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

ALTER TABLE similar_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Similar cases readable by all authenticated"
  ON similar_cases FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- 6. HELPERS
-- ============================================================
CREATE TABLE IF NOT EXISTS helpers (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_status  TEXT DEFAULT 'pending'
                         CHECK (verification_status IN ('pending','verified','suspended')),
  helper_type          TEXT NOT NULL
                         CHECK (helper_type IN ('law_student','paralegal','solicitor','barrister','retired_judge','lay_advisor')),
  trust_level          INT DEFAULT 1 CHECK (trust_level BETWEEN 1 AND 5),
  specialty            TEXT[],
  geography            TEXT[],
  bio                  TEXT,
  years_experience     INT DEFAULT 0,
  cases_helped         INT DEFAULT 0,
  success_rate         FLOAT DEFAULT 0,
  avg_rating           FLOAT DEFAULT 0,
  total_reviews        INT DEFAULT 0,
  cpd_hours_earned     FLOAT DEFAULT 0,
  available            BOOLEAN DEFAULT TRUE,
  max_concurrent_cases INT DEFAULT 3,
  active_cases         INT DEFAULT 0,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE helpers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Helpers public readable"
  ON helpers FOR SELECT USING (verification_status = 'verified');

CREATE POLICY "Helpers manage own profile"
  ON helpers FOR ALL USING (auth.uid() = id);

-- ============================================================
-- 7. HELPER REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS helper_requests (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id      UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  helper_id    UUID REFERENCES helpers(id) ON DELETE SET NULL,
  status       TEXT DEFAULT 'open'
                 CHECK (status IN ('open','matched','active','completed','cancelled')),
  urgency      TEXT DEFAULT 'standard'
                 CHECK (urgency IN ('standard','urgent','critical','emergency')),
  case_type    TEXT NOT NULL,
  geography    TEXT,
  hearing_date TIMESTAMPTZ,
  description  TEXT,
  helper_notes TEXT,
  matched_at   TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_helper_requests_user ON helper_requests(user_id);
CREATE INDEX idx_helper_requests_helper ON helper_requests(helper_id);
CREATE INDEX idx_helper_requests_status ON helper_requests(status);

ALTER TABLE helper_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own requests"
  ON helper_requests FOR SELECT USING (auth.uid() = user_id OR auth.uid() = helper_id);

CREATE POLICY "Users create own requests"
  ON helper_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Helpers update matched requests"
  ON helper_requests FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = helper_id);

-- ============================================================
-- 8. HELPER REVIEWS (Reputation)
-- ============================================================
CREATE TABLE IF NOT EXISTS helper_reviews (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  helper_id    UUID NOT NULL REFERENCES helpers(id) ON DELETE CASCADE,
  reviewer_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id   UUID NOT NULL REFERENCES helper_requests(id) ON DELETE CASCADE,
  rating       INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text  TEXT,
  verified     BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reviewer_id, request_id)
);

ALTER TABLE helper_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews public readable"
  ON helper_reviews FOR SELECT USING (TRUE);

CREATE POLICY "Reviewers create own reviews"
  ON helper_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Auto-update helper rating
CREATE OR REPLACE FUNCTION update_helper_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE helpers SET
    avg_rating = (SELECT AVG(rating) FROM helper_reviews WHERE helper_id = NEW.helper_id),
    total_reviews = (SELECT COUNT(*) FROM helper_reviews WHERE helper_id = NEW.helper_id)
  WHERE id = NEW.helper_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_helper_review
  AFTER INSERT OR UPDATE ON helper_reviews
  FOR EACH ROW EXECUTE FUNCTION update_helper_rating();

-- ============================================================
-- 9. DOCUMENT MARKETPLACE
-- ============================================================
CREATE TABLE IF NOT EXISTS marketplace_documents (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  document_type TEXT NOT NULL
                  CHECK (document_type IN ('witness_statement','grievance_letter','et1_form','schedule_loss','bundle_index','without_prejudice','subject_access_request','template','guide','case_study')),
  case_type     TEXT,
  jurisdiction  TEXT DEFAULT 'UK',
  outcome       TEXT CHECK (outcome IN ('won','lost','settled','unknown')),
  success_rate  FLOAT,
  storage_path  TEXT NOT NULL,
  file_size     INT,
  file_type     TEXT,
  download_count INT DEFAULT 0,
  view_count    INT DEFAULT 0,
  avg_rating    FLOAT DEFAULT 0,
  total_ratings INT DEFAULT 0,
  is_verified   BOOLEAN DEFAULT FALSE,
  is_published  BOOLEAN DEFAULT FALSE,
  tags          TEXT[],
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_marketplace_type ON marketplace_documents(document_type);
CREATE INDEX idx_marketplace_published ON marketplace_documents(is_published);

ALTER TABLE marketplace_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published docs readable by all"
  ON marketplace_documents FOR SELECT USING (is_published = TRUE OR auth.uid() = author_id);

CREATE POLICY "Authors manage own docs"
  ON marketplace_documents FOR ALL USING (auth.uid() = author_id);

-- ============================================================
-- 10. DOCUMENT DOWNLOADS
-- ============================================================
CREATE TABLE IF NOT EXISTS document_downloads (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id  UUID NOT NULL REFERENCES marketplace_documents(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_downloads_doc ON document_downloads(document_id);

ALTER TABLE document_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own downloads"
  ON document_downloads FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create downloads"
  ON document_downloads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 11. AI WARNINGS (3-Level System)
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_warnings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  case_id          UUID REFERENCES cases(id) ON DELETE SET NULL,
  warning_level    INT NOT NULL CHECK (warning_level BETWEEN 1 AND 3),
  ai_confidence    FLOAT NOT NULL,
  feature          TEXT NOT NULL,
  context          TEXT,
  ai_response      TEXT,
  ai_instructions  TEXT,
  resolved         BOOLEAN DEFAULT FALSE,
  resolved_at      TIMESTAMPTZ,
  resolved_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_warnings_level ON ai_warnings(warning_level);
CREATE INDEX idx_warnings_resolved ON ai_warnings(resolved);
CREATE INDEX idx_warnings_user ON ai_warnings(user_id);

ALTER TABLE ai_warnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own warnings"
  ON ai_warnings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System inserts warnings"
  ON ai_warnings FOR INSERT WITH CHECK (TRUE);

-- ============================================================
-- 12. EMERGENCY ESCALATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS emergency_escalations (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id           UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  escalation_level  INT NOT NULL CHECK (escalation_level BETWEEN 1 AND 4),
  hearing_date      TIMESTAMPTZ NOT NULL,
  days_until_hearing INT NOT NULL,
  status            TEXT DEFAULT 'active'
                      CHECK (status IN ('active','resolved','solicitor_matched','expired')),
  helper_request_id UUID REFERENCES helper_requests(id) ON DELETE SET NULL,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  resolved_at       TIMESTAMPTZ
);

CREATE INDEX idx_emergency_user ON emergency_escalations(user_id);
CREATE INDEX idx_emergency_status ON emergency_escalations(status);

ALTER TABLE emergency_escalations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own escalations"
  ON emergency_escalations FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 13. ADMIN ACCESS LOG (Court Order)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_access_log (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  second_admin_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  court_order_number TEXT NOT NULL,
  court_order_date   DATE NOT NULL,
  issuing_court      TEXT NOT NULL,
  access_reason      TEXT NOT NULL,
  target_user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_case_id     UUID REFERENCES cases(id) ON DELETE SET NULL,
  data_accessed      JSONB DEFAULT '{}',
  approved_at        TIMESTAMPTZ,
  approved_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address         TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS bypass – admins use service_role key via server only
ALTER TABLE admin_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct access – server only"
  ON admin_access_log FOR ALL USING (FALSE);

-- ============================================================
-- 14. SEED: Sample Similar Cases (UK Tribunal Data)
-- ============================================================
INSERT INTO similar_cases (case_type, protected_characteristics, outcome, settlement_amount, strength_score, key_factors, duration_days, employer_size, anonymized_summary, legal_citation, year) VALUES
('disability_discrimination', ARRAY['disability'], 'won', 28500, 82, ARRAY['failure to make reasonable adjustments','documented medical evidence','written refusal by employer'], 347, 'medium', 'Claimant with chronic condition requested flexible working. Employer refused without proper consideration. ET found failure to make reasonable adjustments under s.21 EA 2010.', 'EA 2010 s.20-21', 2023),
('race_discrimination', ARRAY['race'], 'settled', 15000, 68, ARRAY['comparator evidence','pattern of treatment','witness corroboration'], 198, 'large', 'Claimant subjected to derogatory comments over 8 months. Line manager aware and failed to act. Settled at ACAS conciliation stage.', 'EA 2010 s.13', 2024),
('unfair_dismissal', ARRAY[]::text[], 'won', 22000, 75, ARRAY['procedural failures','no genuine redundancy','suspicious timing'], 412, 'small', 'Dismissed 3 months after raising grievance about working conditions. No proper procedure followed. Compensatory award plus injury to feelings.', 'ERA 1996 s.98', 2023),
('sex_discrimination', ARRAY['sex'], 'won', 35000, 88, ARRAY['direct comparator','documented evidence','management emails'], 289, 'large', 'Female claimant paid significantly less than male counterpart doing equal work. Pay disparity confirmed through subject access request data.', 'EA 2010 s.65', 2024),
('disability_discrimination', ARRAY['disability'], 'lost', 0, 34, ARRAY['insufficient medical evidence','delay in raising claim','no comparator'], 156, 'micro', 'Claimant unable to demonstrate disability met EA 2010 definition. Medical evidence inconclusive. Claim dismissed at preliminary hearing.', 'EA 2010 s.6', 2022),
('whistleblowing', ARRAY[]::text[], 'won', 45000, 91, ARRAY['protected disclosure clearly made','direct causal link','contemporaneous notes'], 521, 'public_sector', 'Claimant made protected disclosure about financial irregularities. Suffered detriment within weeks. Strong documentary evidence led to maximum award.', 'ERA 1996 s.43A', 2024);
