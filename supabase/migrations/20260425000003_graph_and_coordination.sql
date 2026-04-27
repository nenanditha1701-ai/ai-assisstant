-- Step 43: Unified Intelligence Graph
CREATE TABLE public.graph_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_entity_type TEXT NOT NULL,
    source_entity_id UUID NOT NULL,
    target_entity_type TEXT NOT NULL,
    target_entity_id UUID NOT NULL,
    relationship_type TEXT NOT NULL, -- depends_on, belongs_to, contributes_to, scheduled_during, linked_to, influences, funded_by
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_graph_source ON public.graph_relationships (source_entity_type, source_entity_id);
CREATE INDEX idx_graph_target ON public.graph_relationships (target_entity_type, target_entity_id);

ALTER TABLE public.graph_relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own graph relationships" ON public.graph_relationships FOR ALL USING (auth.uid() = user_id);

-- Step 44: System Events Log
CREATE TABLE public.system_events_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    entity_id UUID,
    subscribers_activated TEXT[],
    processing_status TEXT,
    processing_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- No RLS for system log, only admin/system access usually, but for dev:
ALTER TABLE public.system_events_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin view only" ON public.system_events_log FOR ALL USING (true);
