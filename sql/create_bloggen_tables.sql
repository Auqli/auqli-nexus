-- Create blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    vertical TEXT,
    keyword TEXT,
    word_count INTEGER,
    source TEXT CHECK (source IN ('manual', 'scheduled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    output_type TEXT CHECK (output_type IN ('copyable', 'downloadable')),
    is_downloaded BOOLEAN DEFAULT FALSE,
    download_format TEXT,
    CONSTRAINT blogs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create bloggen_presets table
CREATE TABLE IF NOT EXISTS public.bloggen_presets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_tone TEXT,
    writing_style TEXT,
    blog_components JSONB DEFAULT '{"intro": true, "cta": true, "stats": true}'::jsonb,
    reference_links JSONB DEFAULT '[]'::jsonb,
    vertical_focus JSONB DEFAULT '[]'::jsonb,
    keywords JSONB DEFAULT '[]'::jsonb,
    word_count_target INTEGER DEFAULT 2500,
    preferred_model TEXT DEFAULT 'mistralai/Mistral-Small-24B-Instruct-2501',
    daily_schedule_enabled BOOLEAN DEFAULT FALSE,
    scheduled_count_per_day INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT bloggen_presets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT bloggen_presets_scheduled_count_check CHECK (scheduled_count_per_day BETWEEN 1 AND 20)
);

-- Create generation_logs table
CREATE TABLE IF NOT EXISTS public.generation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    trigger_type TEXT CHECK (trigger_type IN ('manual', 'scheduled')),
    count INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT generation_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create unique constraint to ensure one preset per user
ALTER TABLE public.bloggen_presets
DROP CONSTRAINT IF EXISTS bloggen_presets_user_id_key;

ALTER TABLE public.bloggen_presets
ADD CONSTRAINT bloggen_presets_user_id_key UNIQUE (user_id);

-- Add RLS policies
-- Blogs table policies
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY blogs_select_policy ON public.blogs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY blogs_insert_policy ON public.blogs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY blogs_update_policy ON public.blogs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY blogs_delete_policy ON public.blogs
    FOR DELETE USING (auth.uid() = user_id);

-- Bloggen presets table policies
ALTER TABLE public.bloggen_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY bloggen_presets_select_policy ON public.bloggen_presets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY bloggen_presets_insert_policy ON public.bloggen_presets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY bloggen_presets_update_policy ON public.bloggen_presets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY bloggen_presets_delete_policy ON public.bloggen_presets
    FOR DELETE USING (auth.uid() = user_id);

-- Generation logs table policies
ALTER TABLE public.generation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY generation_logs_select_policy ON public.generation_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY generation_logs_insert_policy ON public.generation_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY generation_logs_update_policy ON public.generation_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY generation_logs_delete_policy ON public.generation_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS blogs_user_id_idx ON public.blogs(user_id);
CREATE INDEX IF NOT EXISTS blogs_created_at_idx ON public.blogs(created_at);
CREATE INDEX IF NOT EXISTS generation_logs_user_id_idx ON public.generation_logs(user_id);
CREATE INDEX IF NOT EXISTS generation_logs_timestamp_idx ON public.generation_logs(timestamp);
