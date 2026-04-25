-- Workload Events Log table for Overload Detection
CREATE TABLE public.workload_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    utilization_ratio FLOAT NOT NULL,
    tasks_flagged UUID[],
    action_taken TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.workload_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own workload events" ON public.workload_events USING (auth.uid() = user_id);
