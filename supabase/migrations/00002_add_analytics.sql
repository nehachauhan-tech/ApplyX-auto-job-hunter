-- ApplyX Analytics Tables
-- Migration: Add analytics and tracking tables

-- ============================================
-- ANALYTICS & METRICS
-- ============================================

-- Daily application statistics per user
CREATE TABLE public.application_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    applications_sent INTEGER DEFAULT 0,
    applications_viewed INTEGER DEFAULT 0,
    interviews_scheduled INTEGER DEFAULT 0,
    offers_received INTEGER DEFAULT 0,
    rejections INTEGER DEFAULT 0,
    auto_applied INTEGER DEFAULT 0,
    manual_applied INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

CREATE INDEX idx_application_stats_user_date ON public.application_stats(user_id, date DESC);

-- Resume performance tracking
CREATE TABLE public.resume_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    applications_used INTEGER DEFAULT 0,
    interviews_resulted INTEGER DEFAULT 0,
    avg_ats_score DECIMAL(5,2),
    top_matching_keywords TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(resume_id, date)
);

-- Platform performance tracking
CREATE TABLE public.platform_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    date DATE NOT NULL,
    jobs_found INTEGER DEFAULT 0,
    applications_sent INTEGER DEFAULT 0,
    response_rate DECIMAL(5,2),
    avg_response_time_hours INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, platform, date)
);

-- User activity logs
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id, created_at DESC);

-- ============================================
-- SAVED SEARCHES & ALERTS
-- ============================================

CREATE TABLE public.saved_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    query JSONB NOT NULL,
    is_alert_enabled BOOLEAN DEFAULT FALSE,
    alert_frequency TEXT CHECK (alert_frequency IN ('instant', 'daily', 'weekly')) DEFAULT 'daily',
    last_alerted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.application_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own application stats" ON public.application_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own resume analytics" ON public.resume_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.resumes
            WHERE resumes.id = resume_analytics.resume_id
            AND resumes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own platform analytics" ON public.platform_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activity logs" ON public.activity_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own saved searches" ON public.saved_searches
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS FOR ANALYTICS
-- ============================================

-- Function to update daily application stats
CREATE OR REPLACE FUNCTION update_application_stats()
RETURNS TRIGGER AS $$
DECLARE
    stat_date DATE;
BEGIN
    stat_date := COALESCE(NEW.applied_at::DATE, CURRENT_DATE);

    INSERT INTO public.application_stats (user_id, date, applications_sent, auto_applied, manual_applied)
    VALUES (
        NEW.user_id,
        stat_date,
        1,
        CASE WHEN NEW.applied_via = 'auto' THEN 1 ELSE 0 END,
        CASE WHEN NEW.applied_via = 'manual' THEN 1 ELSE 0 END
    )
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        applications_sent = application_stats.applications_sent + 1,
        auto_applied = application_stats.auto_applied + CASE WHEN NEW.applied_via = 'auto' THEN 1 ELSE 0 END,
        manual_applied = application_stats.manual_applied + CASE WHEN NEW.applied_via = 'manual' THEN 1 ELSE 0 END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_stats_on_application
    AFTER INSERT ON public.applications
    FOR EACH ROW
    WHEN (NEW.status = 'applied')
    EXECUTE FUNCTION update_application_stats();

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_activity(
    p_user_id UUID,
    p_action TEXT,
    p_entity_type TEXT DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, metadata)
    VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_metadata)
    RETURNING id INTO log_id;

    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
