-- Step 48: Decision Support
CREATE TABLE public.decision_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scenario_type TEXT NOT NULL, -- project_acceptance, deadline_tradeoff, delegation
    input_data JSONB NOT NULL,
    simulated_outcomes JSONB NOT NULL, -- Array of scenarios (Accept, Decline, etc.)
    recommended_option TEXT,
    confidence_score FLOAT,
    status TEXT DEFAULT 'pending', -- pending, decided
    selected_option TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.decision_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own decision scenarios" ON public.decision_scenarios FOR ALL USING (auth.uid() = user_id);
