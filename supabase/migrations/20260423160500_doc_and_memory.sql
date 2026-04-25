-- Document Intelligence table
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_type TEXT,
    storage_url TEXT NOT NULL,
    file_size INTEGER,
    processing_status TEXT DEFAULT 'pending',
    summary TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Links table (links documents to tasks, meetings, goals)
CREATE TABLE public.document_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL, -- task, meeting, goal
    entity_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own documents" ON public.documents USING (auth.uid() = user_id);
CREATE POLICY "Users can access links of their documents" ON public.document_links
USING (EXISTS (SELECT 1 FROM public.documents WHERE id = document_id AND user_id = auth.uid()));

-- Context Memory indexing and maintenance logic is already partially in Step 5 schema.
-- Adding access_count and relevance_score updates is handled by application logic.
