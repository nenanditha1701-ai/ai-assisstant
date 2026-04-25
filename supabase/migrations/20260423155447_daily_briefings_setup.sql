-- Daily Briefings table
CREATE TABLE public.daily_briefings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    briefing_date DATE NOT NULL,
    content_json JSONB NOT NULL,
    rendered_text TEXT,
    delivery_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.daily_briefings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own briefings" ON public.daily_briefings USING (auth.uid() = user_id);
