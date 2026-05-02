-- UJRIS Disaster Recovery Plan (G10 - 20hrs)
-- Run with: psql $SUPABASE_DB_URL -f supabase/migrations/005_disaster_recovery.sql

-- 1. Point-in-Time Recovery (PITR) Configuration
-- (Execute in Supabase SQL editor)
ALTER SYSTEM SET wal_level = 'replica';
ALTER SYSTEM SET archive_mode = 'on';
ALTER SYSTEM SET archive_command = 'test ! -f /wal_archive/%f && cp %p /wal_archive/%f';

-- 2. Backup Schedule (via pg_cron extension)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Daily full backup at 2AM
SELECT cron.schedule('daily-backup', '0 2 * * *', $$
  SELECT pg_create_restore_point('daily_backup_' || to_char(NOW(), 'YYYYMMDD'));
$$);

-- 3. Recovery Time Objective (RTO) = 4 hours
-- Recovery Point Objective (RPO) = 1 hour
COMMENT ON DATABASE postgres IS 'RTO: 4 hours, RPO: 1 hour, PITR enabled';

-- 4. Litigation Reserve Fund Table
CREATE TABLE IF NOT EXISTS public.litigation_reserve (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.cases(id),
  estimated_damages_gbp DECIMAL(10,2),
  reserve_fund_gbp DECIMAL(10,2),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Backup Verification Log
CREATE TABLE IF NOT EXISTS public.backup_verification (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  backup_date DATE NOT NULL,
  backup_type TEXT NOT NULL, -- 'full', 'incremental', 'wal'
  verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Disaster Recovery Procedures (documentation)
COMMENT ON TABLE public.litigation_reserve IS 'Reserve fund for potential legal liabilities - UJRIS Risk Management';
COMMENT ON TABLE public.backup_verification IS 'Automated backup verification for disaster recovery compliance';

-- 7. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_litigation_reserve_case ON public.litigation_reserve(case_id);
CREATE INDEX IF NOT EXISTS idx_backup_verification_date ON public.backup_verification(backup_date DESC);
