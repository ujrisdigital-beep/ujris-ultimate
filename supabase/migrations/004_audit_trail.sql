-- UJRIS Ultimate: Audit Trail Migration
-- Run with: psql $SUPABASE_DB_URL -f supabase/migrations/004_audit_trail.sql

CREATE TABLE IF NOT EXISTS public.data_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  operation TEXT CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_table ON public.data_audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_record ON public.data_audit_log(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.data_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON public.data_audit_log(user_id);

COMMENT ON TABLE public.data_audit_log IS 'Tracks all data modifications for compliance and debugging';

CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.data_audit_log (table_name, record_id, operation, old_data, new_data, user_id)
  VALUES (TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to key tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'cases_audit_trigger') THEN
    CREATE TRIGGER cases_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.cases
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'evidence_audit_trigger') THEN
    CREATE TRIGGER evidence_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.evidence
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
  END IF;
END
$$;
