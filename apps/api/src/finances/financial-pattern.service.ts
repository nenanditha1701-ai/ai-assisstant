import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { AIService } from '../common/services/ai.service';

@Injectable()
export class FinancialPatternService {
  constructor(
    private supabase: SupabaseService,
    private ai: AIService
  ) {}

  async analyzeSpending(userId: string) {
    const adminClient = this.supabase.getAdminClient();

    // 1. Fetch history (6 months)
    const { data: summaries } = await adminClient
      .from('financial_summaries')
      .select('*')
      .eq('user_id', userId)
      .order('month_year', { ascending: false })
      .limit(6);

    if (!summaries || summaries.length < 2) return;

    // 2. spending trend analysis
    // ... logic for trend growth

    // 3. AI Insight generation (Step 40)
    const prompt = `
      Analyze the following financial data for the user and generate 3 actionable insights:
      ${JSON.stringify(summaries)}

      Format: JSON array of objects with { insight_text, metric_type, impact_estimate }.
      Focus on spending trends and budget deviations.
    `;

    try {
      const insights = await this.ai.generateStructuredResponse(prompt);
      await adminClient
        .from('financial_insights')
        .insert(insights.map((i: any) => ({ ...i, user_id: userId })));

      return insights;
    } catch (e) {
      console.error('Financial Analysis Error:', e);
    }
  }

  async detectAnomalies(userId: string, transaction: any) {
    // Step 40: simple anomaly detection
    const { data: avg } = await this.supabase.getClient()
      .from('financial_transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('category', transaction.category);

    if (!avg || avg.length < 5) return false;

    const amounts = avg.map(a => Number(a.amount));
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(amounts.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / amounts.length);

    if (Math.abs(transaction.amount) > mean + (3 * stdDev)) {
      // anomaly detected
      return true;
    }
    return false;
  }
}
