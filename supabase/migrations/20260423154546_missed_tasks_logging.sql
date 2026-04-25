-- Missed Tasks Log table
CREATE TABLE public.missed_tasks_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    original_deadline TIMESTAMPTZ,
    reason_category TEXT,
    detected_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.missed_tasks_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own missed task logs" ON public.missed_tasks_log USING (auth.uid() = user_id);
