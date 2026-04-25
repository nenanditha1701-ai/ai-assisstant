-- Meeting Recording and Intelligence
CREATE TABLE public.meeting_recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    storage_url TEXT NOT NULL,
    file_size INTEGER,
    duration INTEGER,
    transcription_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.meeting_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recording_id UUID REFERENCES public.meeting_recordings(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.meeting_intelligence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
    summary TEXT,
    decisions JSONB,
    action_items JSONB,
    discussion_topics JSONB,
    unresolved_items JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.meeting_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own recordings" ON public.meeting_recordings USING (auth.uid() = user_id);
CREATE POLICY "Users can access transcripts of their recordings" ON public.meeting_transcripts
USING (EXISTS (SELECT 1 FROM public.meeting_recordings WHERE id = recording_id AND user_id = auth.uid()));
CREATE POLICY "Users can access their meeting intelligence" ON public.meeting_intelligence
USING (EXISTS (SELECT 1 FROM public.meetings WHERE id = meeting_id AND user_id = auth.uid()));
