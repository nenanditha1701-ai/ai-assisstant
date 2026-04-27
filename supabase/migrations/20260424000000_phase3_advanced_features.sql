-- Step 25: Behavioral Pattern Learning
CREATE TABLE public.behavioral_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 29-31: Goals Evolution
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS parent_goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS target_date DATE;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS success_metric TEXT;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS progress_mode TEXT DEFAULT 'task-based'; -- task-based, milestone-based, metric-based

CREATE TABLE public.goal_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_date DATE,
    status TEXT DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.goal_progress_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    progress_percentage FLOAT NOT NULL,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 32: Collaboration Infrastructure
CREATE TABLE public.workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member', -- owner, admin, member, viewer
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL;
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL;

-- Step 35: Forecasting
CREATE TABLE public.workload_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    forecast_date DATE NOT NULL,
    utilization_ratio FLOAT NOT NULL,
    risk_category TEXT NOT NULL, -- low, medium, high, critical
    contributing_factors JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 47: Autonomy Control
CREATE TABLE public.autonomy_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    autonomy_level TEXT NOT NULL DEFAULT 'advisory', -- advisory, semi-autonomous, autonomous
    auto_reschedule_low_priority BOOLEAN DEFAULT FALSE,
    auto_generate_weekly_plan BOOLEAN DEFAULT FALSE,
    auto_extend_deadlines BOOLEAN DEFAULT FALSE,
    max_auto_reschedule_days INTEGER DEFAULT 7,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.autonomous_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    before_state JSONB,
    after_state JSONB,
    reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 28: Decision Support
CREATE TABLE public.decision_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    decision_type TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    reasoning_steps JSONB DEFAULT '[]',
    constraints_applied JSONB DEFAULT '{}',
    outcome JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.behavioral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_progress_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workload_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autonomy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autonomous_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own behavioral events" ON public.behavioral_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access milestones of their goals" ON public.goal_milestones FOR ALL USING (
    EXISTS (SELECT 1 FROM public.goals WHERE id = goal_id AND (user_id = auth.uid() OR workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())))
);
CREATE POLICY "Users can access their goal snapshots" ON public.goal_progress_snapshots FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access workspaces they belong to" ON public.workspaces FOR ALL USING (
    owner_id = auth.uid() OR id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
);
CREATE POLICY "Users can access members of their workspaces" ON public.workspace_members FOR ALL USING (
    workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid()) OR user_id = auth.uid()
);
CREATE POLICY "Users can access their workload forecasts" ON public.workload_forecasts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their autonomy settings" ON public.autonomy_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their autonomous actions" ON public.autonomous_actions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their decision logs" ON public.decision_logs FOR ALL USING (auth.uid() = user_id);

-- Step 36: Scheduling Optimization Logs
CREATE TABLE public.schedule_optimization_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    previous_slot JSONB,
    new_slot JSONB,
    optimization_pass TEXT NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'applied', -- applied, pending_review, rejected, reverted
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.schedule_optimization_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own optimization logs" ON public.schedule_optimization_logs FOR ALL USING (auth.uid() = user_id);
