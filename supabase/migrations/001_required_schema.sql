-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- ============================================================
-- profiles table: add missing columns
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name          text,
  ADD COLUMN IF NOT EXISTS first_name         text,
  ADD COLUMN IF NOT EXISTS last_name          text,
  ADD COLUMN IF NOT EXISTS avatar_url         text,
  ADD COLUMN IF NOT EXISTS resume_url         text,
  ADD COLUMN IF NOT EXISTS location           text,
  ADD COLUMN IF NOT EXISTS skills             text[],
  ADD COLUMN IF NOT EXISTS job_title          text,
  ADD COLUMN IF NOT EXISTS company_name       text,
  ADD COLUMN IF NOT EXISTS company_website    text,
  ADD COLUMN IF NOT EXISTS industry           text,
  ADD COLUMN IF NOT EXISTS company_size       text,
  ADD COLUMN IF NOT EXISTS account_type       text DEFAULT 'jobseeker',
  ADD COLUMN IF NOT EXISTS edu_verified       boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS subscription_status text,
  ADD COLUMN IF NOT EXISTS subscription_tier  text,
  ADD COLUMN IF NOT EXISTS email              text;

-- ============================================================
-- jobs table: add missing columns
-- ============================================================
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS company            text,
  ADD COLUMN IF NOT EXISTS salary_min         integer,
  ADD COLUMN IF NOT EXISTS salary_max         integer,
  ADD COLUMN IF NOT EXISTS employer_id        uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS status             text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS location_type      text,
  ADD COLUMN IF NOT EXISTS job_type           text,
  ADD COLUMN IF NOT EXISTS experience         text,
  ADD COLUMN IF NOT EXISTS posted_at          timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at         timestamptz;

-- ============================================================
-- applications table: add missing columns
-- ============================================================
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS viewed_at          timestamptz,
  ADD COLUMN IF NOT EXISTS nudge_sent_at      timestamptz,
  ADD COLUMN IF NOT EXISTS withdrawn_at       timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at         timestamptz;

-- ============================================================
-- flagged_accounts table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.flagged_accounts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) NOT NULL,
  reason        text NOT NULL,
  flagged_at    timestamptz DEFAULT now(),
  resolved_at   timestamptz,
  paused_until  timestamptz
);

-- ============================================================
-- ambassador_applications table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ambassador_applications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text NOT NULL UNIQUE,
  school      text NOT NULL,
  year        text NOT NULL,
  why         text NOT NULL,
  status      text NOT NULL DEFAULT 'pending',
  applied_at  timestamptz DEFAULT now()
);

-- ============================================================
-- saved_jobs table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid REFERENCES auth.users(id) NOT NULL,
  job_id    uuid REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  saved_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, job_id)
);

-- ============================================================
-- RLS policies for new tables
-- ============================================================

-- ambassador_applications: anyone can insert, service role can read
ALTER TABLE public.ambassador_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "anyone can apply as ambassador"
  ON public.ambassador_applications FOR INSERT WITH CHECK (true);

-- saved_jobs: users manage their own
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "users manage own saved jobs"
  ON public.saved_jobs FOR ALL USING (auth.uid() = user_id);

-- flagged_accounts: service role only (no user access)
ALTER TABLE public.flagged_accounts ENABLE ROW LEVEL SECURITY;
