-- Step 45: Autonomous Planning
CREATE TABLE public.autonomous_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL, -- weekly_plan, goal_execution, recovery_plan
    entity_id UUID, -- Goal ID, etc.
    content_json JSONB NOT NULL,
    status TEXT DEFAULT 'draft', -- draft, approved, rejected, modified
    planning_rationale TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.autonomous_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own autonomous plans" ON public.autonomous_plans FOR ALL USING (auth.uid() = user_id);
