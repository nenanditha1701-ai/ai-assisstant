-- Step 39: Financial Awareness System
CREATE TABLE public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(12,2) NOT NULL,
    transaction_type TEXT NOT NULL, -- income, expense
    category TEXT NOT NULL, -- food, transport, utilities, subscriptions, salary, freelance, investment, etc.
    payment_method TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule TEXT, -- RRULE format
    source_vendor TEXT,
    goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.budget_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    monthly_limit DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, category)
);

CREATE TABLE public.financial_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month_year DATE NOT NULL, -- First day of the month
    total_income DECIMAL(12,2) DEFAULT 0,
    total_expenses DECIMAL(12,2) DEFAULT 0,
    net_cash_flow DECIMAL(12,2) DEFAULT 0,
    savings_rate FLOAT DEFAULT 0,
    category_breakdown JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, month_year)
);

-- Step 40: Financial Insights
CREATE TABLE public.financial_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_text TEXT NOT NULL,
    metric_type TEXT, -- budget_deviation, spending_trend, recurring_audit
    impact_estimate TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own financial transactions" ON public.financial_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own budget limits" ON public.budget_limits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own financial summaries" ON public.financial_summaries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own financial insights" ON public.financial_insights FOR ALL USING (auth.uid() = user_id);
