-- ApplyX Database Schema
-- Initial migration: Users, Profiles, Resumes, Jobs, Applications, Platform Connections

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS & PROFILES
-- ============================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    location TEXT,
    headline TEXT,
    bio TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences for job search
CREATE TABLE public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    desired_roles TEXT[] DEFAULT '{}',
    desired_locations TEXT[] DEFAULT '{}',
    remote_preference TEXT CHECK (remote_preference IN ('remote', 'hybrid', 'onsite', 'any')) DEFAULT 'any',
    min_salary INTEGER,
    max_salary INTEGER,
    salary_currency TEXT DEFAULT 'USD',
    experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive')) DEFAULT 'mid',
    job_types TEXT[] DEFAULT '{"full-time"}',
    industries TEXT[] DEFAULT '{}',
    excluded_companies TEXT[] DEFAULT '{}',
    auto_apply_enabled BOOLEAN DEFAULT FALSE,
    daily_apply_limit INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RESUMES
-- ============================================

CREATE TABLE public.resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'My Resume',
    is_primary BOOLEAN DEFAULT FALSE,
    original_file_url TEXT,
    parsed_content JSONB,
    ats_score INTEGER,
    skills TEXT[] DEFAULT '{}',
    experience JSONB DEFAULT '[]',
    education JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optimized resume versions for specific jobs
CREATE TABLE public.resume_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
    job_id UUID,
    optimized_content JSONB,
    ats_score INTEGER,
    keywords_matched TEXT[] DEFAULT '{}',
    suggestions JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PLATFORM CONNECTIONS
-- ============================================

CREATE TABLE public.platform_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'indeed', 'naukri', 'unstop', 'internshala', 'glassdoor', 'angellist', 'ycombinator')),
    status TEXT CHECK (status IN ('connected', 'disconnected', 'expired', 'error')) DEFAULT 'disconnected',
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    profile_data JSONB,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- ============================================
-- JOBS
-- ============================================

CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id TEXT,
    platform TEXT NOT NULL,
    title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    company_logo_url TEXT,
    location TEXT,
    is_remote BOOLEAN DEFAULT FALSE,
    job_type TEXT,
    experience_level TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency TEXT DEFAULT 'USD',
    description TEXT,
    requirements TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    benefits TEXT[] DEFAULT '{}',
    apply_url TEXT,
    posted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(platform, external_id)
);

-- Create index for faster job searches
CREATE INDEX idx_jobs_platform ON public.jobs(platform);
CREATE INDEX idx_jobs_title ON public.jobs USING gin(to_tsvector('english', title));
CREATE INDEX idx_jobs_skills ON public.jobs USING gin(skills);

-- ============================================
-- APPLICATIONS
-- ============================================

CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    resume_version_id UUID REFERENCES public.resume_versions(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('draft', 'pending', 'applied', 'viewed', 'in_review', 'interview', 'offer', 'rejected', 'withdrawn')) DEFAULT 'draft',
    applied_via TEXT CHECK (applied_via IN ('auto', 'manual', 'quick_apply')),
    cover_letter TEXT,
    answers JSONB,
    applied_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_applications_user ON public.applications(user_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_applied_at ON public.applications(applied_at DESC);

-- Application status history
CREATE TABLE public.application_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- ============================================
-- RECRUITER OUTREACH
-- ============================================

CREATE TABLE public.recruiters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    linkedin_url TEXT,
    company_name TEXT,
    title TEXT,
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.outreach_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    recruiter_id UUID REFERENCES public.recruiters(id) ON DELETE SET NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    subject TEXT,
    body TEXT NOT NULL,
    status TEXT CHECK (status IN ('draft', 'scheduled', 'sent', 'delivered', 'opened', 'replied', 'bounced')) DEFAULT 'draft',
    sent_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('application_update', 'new_match', 'interview_invite', 'message', 'system')) NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User Preferences: Users can only access their own preferences
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Resumes: Users can only access their own resumes
CREATE POLICY "Users can manage own resumes" ON public.resumes
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own resume versions" ON public.resume_versions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.resumes
            WHERE resumes.id = resume_versions.resume_id
            AND resumes.user_id = auth.uid()
        )
    );

-- Platform Connections: Users can only access their own connections
CREATE POLICY "Users can manage own connections" ON public.platform_connections
    FOR ALL USING (auth.uid() = user_id);

-- Applications: Users can only access their own applications
CREATE POLICY "Users can manage own applications" ON public.applications
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own application history" ON public.application_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.applications
            WHERE applications.id = application_history.application_id
            AND applications.user_id = auth.uid()
        )
    );

-- Outreach Messages: Users can only access their own messages
CREATE POLICY "Users can manage own outreach" ON public.outreach_messages
    FOR ALL USING (auth.uid() = user_id);

-- Notifications: Users can only access their own notifications
CREATE POLICY "Users can manage own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- Jobs: Anyone can read jobs (public data)
CREATE POLICY "Jobs are viewable by everyone" ON public.jobs
    FOR SELECT USING (true);

-- Recruiters: Anyone can read recruiters (public data)
CREATE POLICY "Recruiters are viewable by everyone" ON public.recruiters
    FOR SELECT USING (true);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_resumes_updated_at
    BEFORE UPDATE ON public.resumes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_platform_connections_updated_at
    BEFORE UPDATE ON public.platform_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );

    -- Also create default preferences
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to track application status changes
CREATE OR REPLACE FUNCTION track_application_status()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.application_history (application_id, old_status, new_status)
        VALUES (NEW.id, OLD.status, NEW.status);

        -- Update last_activity_at
        NEW.last_activity_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_application_status_changes
    BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION track_application_status();

-- ============================================
-- SEED DATA (Optional - Comment out in production)
-- ============================================

-- You can add sample jobs here for testing
-- INSERT INTO public.jobs (platform, title, company_name, ...) VALUES (...);
