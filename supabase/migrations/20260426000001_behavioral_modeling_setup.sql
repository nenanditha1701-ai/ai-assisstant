-- Step 46: Behavioral Modeling
CREATE TABLE public.behavioral_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    model_type TEXT NOT NULL, -- completion_probability, postponement_likelihood, burnout_risk, optimal_focus
    output_data JSONB NOT NULL,
    calibrated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, model_type)
);

ALTER TABLE public.behavioral_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own behavioral models" ON public.behavioral_models FOR ALL USING (auth.uid() = user_id);
