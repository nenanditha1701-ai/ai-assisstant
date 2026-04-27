-- Step 41: Travel Planning Intelligence
CREATE TABLE public.travel_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    destination TEXT NOT NULL,
    departure_date DATE NOT NULL,
    return_date DATE NOT NULL,
    purpose TEXT NOT NULL, -- personal, business, mixed
    budget DECIMAL(12,2),
    status TEXT DEFAULT 'planning', -- planning, confirmed, completed, cancelled
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.travel_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    travel_plan_id UUID NOT NULL REFERENCES public.travel_plans(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL, -- flight, accommodation, visa, transport, document, packing_item, activity
    title TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    due_date DATE,
    estimated_cost DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.travel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own travel plans" ON public.travel_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access items of their travel plans" ON public.travel_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.travel_plans WHERE id = travel_plan_id AND user_id = auth.uid())
);
