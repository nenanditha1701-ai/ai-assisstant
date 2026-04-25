-- User Modes table
CREATE TABLE public.user_modes (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    active_mode TEXT CHECK (active_mode IN ('work', 'personal', 'focus')) DEFAULT 'personal',
    activated_at TIMESTAMPTZ DEFAULT NOW(),
    auto_end_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_modes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own modes" ON public.user_modes USING (auth.uid() = user_id);
