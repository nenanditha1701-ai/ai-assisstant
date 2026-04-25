-- Document Intelligence System
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    storage_url TEXT NOT NULL,
    file_size INTEGER,
    processing_status TEXT DEFAULT 'pending',
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.document_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    extracted_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.document_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL, -- task, meeting, goal
    entity_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own documents" ON public.documents USING (auth.uid() = user_id);
CREATE POLICY "Users can access metadata of their documents" ON public.document_metadata
USING (EXISTS (SELECT 1 FROM public.documents WHERE id = document_id AND user_id = auth.uid()));
CREATE POLICY "Users can access links of their documents" ON public.document_links
USING (EXISTS (SELECT 1 FROM public.documents WHERE id = document_id AND user_id = auth.uid()));
