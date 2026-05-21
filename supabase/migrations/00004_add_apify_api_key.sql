-- Migration: Add Apify API Key to user preferences
-- This allows users to use their own Apify API key for job scraping

-- Add apify_api_key column to user_preferences table
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS apify_api_key TEXT;

-- Add job_match_scores table to store AI-analyzed job matches
CREATE TABLE IF NOT EXISTS public.job_match_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL,
    interview_probability INTEGER,
    selection_probability INTEGER,
    skills_match JSONB,
    experience_match JSONB,
    location_match JSONB,
    salary_match JSONB,
    strengths TEXT[] DEFAULT '{}',
    improvements TEXT[] DEFAULT '{}',
    application_tips TEXT[] DEFAULT '{}',
    recruiter_perspective TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

-- Enable RLS
ALTER TABLE public.job_match_scores ENABLE ROW LEVEL SECURITY;

-- Policy for job match scores
CREATE POLICY "Users can manage own job match scores" ON public.job_match_scores
    FOR ALL USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_job_match_scores_user ON public.job_match_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_job_match_scores_score ON public.job_match_scores(overall_score DESC);

-- Trigger for updated_at
CREATE TRIGGER update_job_match_scores_updated_at
    BEFORE UPDATE ON public.job_match_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
