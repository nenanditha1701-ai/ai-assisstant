-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS Table (handled by Supabase Auth, but we can extend it or use a profile table)
-- Supabase manages the auth.users table. We link to it.

-- USER PROFILES Table
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    assistant_name TEXT DEFAULT 'Assistant',
    avatar_url TEXT,
    personality_type TEXT CHECK (personality_type IN ('Professional', 'Friendly', 'Motivational', 'Calm', 'Direct')) DEFAULT 'Professional',
    location TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TASKS Table
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_id UUID, -- Foreign key added later
    routine_id UUID, -- Foreign key added later
    title TEXT NOT NULL,
    description TEXT,
    deadline TIMESTAMPTZ,
    estimated_duration INTEGER, -- in minutes
    actual_duration INTEGER, -- in minutes
    priority INTEGER CHECK (priority BETWEEN 1 AND 5) DEFAULT 3,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'deferred')) DEFAULT 'pending',
    tags TEXT[],
    recurrence_rule TEXT,
    scheduled_start TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GOALS Table
CREATE TABLE public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_goal_id UUID REFERENCES public.goals(id),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    target_date TIMESTAMPTZ,
    success_metric TEXT,
    priority INTEGER CHECK (priority BETWEEN 1 AND 5) DEFAULT 3,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to tasks now that goals exists
ALTER TABLE public.tasks ADD CONSTRAINT fk_tasks_goal FOREIGN KEY (goal_id) REFERENCES public.goals(id);

-- MEETINGS Table
CREATE TABLE public.meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    location TEXT,
    is_virtual BOOLEAN DEFAULT FALSE,
    participants JSONB,
    recurrence_rule TEXT,
    reminder_offsets INTEGER[],
    external_calendar_id TEXT,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROUTINES Table
CREATE TABLE public.routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_time TIME NOT NULL, -- HH:MM
    end_time TIME NOT NULL, -- HH:MM
    category TEXT CHECK (category IN ('work', 'sleep', 'focus', 'exercise', 'travel', 'personal')),
    recurrence_pattern TEXT DEFAULT 'daily',
    active_days INTEGER[], -- 0-6
    priority_weight INTEGER DEFAULT 1,
    work_mode TEXT CHECK (work_mode IN ('remote', 'hybrid', 'on-site')),
    location TEXT,
    commute_duration INTEGER DEFAULT 0,
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS Table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    channel TEXT NOT NULL,
    status TEXT NOT NULL,
    delivery_log JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATION PREFERENCES Table
CREATE TABLE public.notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    enabled_channels TEXT[], -- email, push, sms, in-app
    frequency_mode TEXT DEFAULT 'instant',
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '07:00',
    category_toggles JSONB DEFAULT '{}',
    rate_limit_per_hour INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONTEXT MEMORY Table
CREATE TABLE public.context_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source TEXT,
    source_id UUID,
    memory_type TEXT,
    content TEXT NOT NULL,
    relevance_score FLOAT DEFAULT 1.0,
    tags TEXT[],
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TASK DEPENDENCIES Table
CREATE TABLE public.task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    dependency_type TEXT CHECK (dependency_type IN ('blocked_by', 'parent_child', 'sequential', 'parallel')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT LOGS Table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROUTINE EXCEPTIONS Table
CREATE TABLE public.routine_exceptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
    exception_date DATE NOT NULL,
    override_type TEXT CHECK (override_type IN ('modified', 'cancelled')),
    new_start_time TIME,
    new_end_time TIME,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DAY OFF PERIODS Table
CREATE TABLE public.day_off_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    type TEXT CHECK (type IN ('vacation', 'public_holiday', 'sick_day', 'personal', 'custom')),
    label TEXT,
    auto_reschedule BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES for Performance
CREATE INDEX idx_tasks_user_status ON public.tasks(user_id, status);
CREATE INDEX idx_tasks_user_deadline ON public.tasks(user_id, deadline);
CREATE INDEX idx_tasks_user_priority ON public.tasks(user_id, priority);
CREATE INDEX idx_meetings_user_start ON public.meetings(user_id, start_time);
CREATE INDEX idx_routines_user_time ON public.routines(user_id, start_time);
CREATE INDEX idx_task_deps_task ON public.task_dependencies(task_id);
CREATE INDEX idx_task_deps_depends ON public.task_dependencies(depends_on_task_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.context_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_off_periods ENABLE ROW LEVEL SECURITY;

-- Simple Policies (User can only access their own data)
CREATE POLICY "Users can only access their own profiles" ON public.user_profiles USING (auth.uid() = id);
CREATE POLICY "Users can only access their own tasks" ON public.tasks USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own goals" ON public.goals USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own meetings" ON public.meetings USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own routines" ON public.routines USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own notifications" ON public.notifications USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own notification_prefs" ON public.notification_preferences USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own memory" ON public.context_memory USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own day_offs" ON public.day_off_periods USING (auth.uid() = user_id);

-- Task dependencies need a more complex policy because they link tasks.
-- For simplicity in Phase 1, we assume task_id owner check.
CREATE POLICY "Users can access their own task dependencies" ON public.task_dependencies
USING (EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid()));

CREATE POLICY "Users can access their own routine exceptions" ON public.routine_exceptions
USING (EXISTS (SELECT 1 FROM public.routines WHERE id = routine_id AND user_id = auth.uid()));

CREATE POLICY "Users can access their own audit logs" ON public.audit_logs USING (auth.uid() = user_id);
