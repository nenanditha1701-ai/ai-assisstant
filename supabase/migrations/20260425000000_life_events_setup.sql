-- Step 42: Life Event Intelligence
CREATE TABLE public.life_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- relocation, career_change, wedding, exam_prep, medical, graduation, etc.
    title TEXT NOT NULL,
    description TEXT,
    target_date DATE NOT NULL,
    status TEXT DEFAULT 'planning', -- planning, active, completed, cancelled
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS life_event_id UUID REFERENCES public.life_events(id) ON DELETE CASCADE;

ALTER TABLE public.life_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own life events" ON public.life_events FOR ALL USING (auth.uid() = user_id);
