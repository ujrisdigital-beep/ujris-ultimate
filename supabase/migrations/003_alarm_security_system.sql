-- Alarm Logs (3-Level Alarm System)
CREATE TABLE IF NOT EXISTS alarm_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 4),
  system TEXT NOT NULL CHECK (system IN ('ujris', 'ikenga', 'ujuCycle', 'fortis')),
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alarm_logs_system ON alarm_logs(system);
CREATE INDEX IF NOT EXISTS idx_alarm_logs_level ON alarm_logs(level);
CREATE INDEX IF NOT EXISTS idx_alarm_logs_resolved ON alarm_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_alarm_logs_created_at ON alarm_logs(created_at DESC);

-- Self-Improvement Log
CREATE TABLE IF NOT EXISTS self_improvement_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  output_hash TEXT NOT NULL,
  success BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id),
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_self_improvement_task ON self_improvement_log(task);
CREATE INDEX IF NOT EXISTS idx_self_improvement_success ON self_improvement_log(success);

-- Audit Logs (Military Grade)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- User Profiles Extension (Email as Primary ID + Temp Email Blocking)
CREATE OR REPLACE FUNCTION check_temp_email()
RETURNS TRIGGER AS $$
DECLARE
  domain TEXT;
  temp_domains TEXT[] := ARRAY[
    'tempmail.com', 'throwawaymail.com', 'mailinator.com', 'guerrillamail.com',
    'sharklasers.com', 'yopmail.com', 'temp-mail.org', 'fakeinator.com'
  ];
BEGIN
  domain := split_part(NEW.email, '@', 2);
  IF domain = ANY(temp_domains) THEN
    RAISE EXCEPTION 'Temporary emails are not allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_check_temp_email ON auth.users;
CREATE TRIGGER trigger_check_temp_email
  BEFORE INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION check_temp_email();

-- Enable RLS
ALTER TABLE alarm_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_improvement_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies (Admin-only access for alarms/audit)
CREATE POLICY IF NOT EXISTS "Admins can see all alarm logs"
  ON alarm_logs FOR ALL
  USING (auth.jwt() ->> 'role' = '"admin"');

CREATE POLICY IF NOT EXISTS "Admins can see all self-improvement logs"
  ON self_improvement_log FOR ALL
  USING (auth.jwt() ->> 'role' = '"admin"');

CREATE POLICY IF NOT EXISTS "Admins can see all audit logs"
  ON audit_logs FOR ALL
  USING (auth.jwt() ->> 'role' = '"admin"');

-- Grant permissions
GRANT ALL ON alarm_logs, self_improvement_log, audit_logs TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
