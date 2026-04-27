import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { AIService } from '../common/services/ai.service';
import { OverloadService } from '../scheduling/overload.service';

@Injectable()
export class DecisionSupportService {
  constructor(
    private supabase: SupabaseService,
    private ai: AIService,
    private overload: OverloadService
  ) {}

  async simulateProjectAcceptance(userId: string, projectData: any) {
    // 1. Fetch current baseline
    const today = new Date().toISOString().split('T')[0];
    const baseline = await this.overload.calculateUtilization(userId, today);

    // 2. Prepare AI Simulation (Step 48)
    const prompt = `
      As a Strategic Decision Assistant, simulate 3 outcomes for accepting this project:
      Project: ${JSON.stringify(projectData)}
      Current Workload: ${JSON.stringify(baseline)}

      Outcomes to simulate:
      1. "Accept": Impact on schedule and current goals.
      2. "Decline": Opportunity cost.
      3. "Accept with Reduced Scope": Trade-offs.

      Return JSON with fields:
      "simulations": [{option, workload_impact_ratio, goal_delay_days, risk_score, description}],
      "recommendation": "the best option string",
      "confidence": 0.0 to 1.0
    `;

    try {
      const result = await this.ai.generateStructuredResponse(prompt);

      const { data, error } = await this.supabase.getAdminClient()
        .from('decision_scenarios')
        .insert({
          user_id: userId,
          scenario_type: 'project_acceptance',
          input_data: projectData,
          simulated_outcomes: result.simulations,
          recommended_option: result.recommendation,
          confidence_score: result.confidence,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Decision Simulation Error:', e);
    }
  }

  async recordDecision(userId: string, scenarioId: string, option: string) {
    await this.supabase.getClient()
      .from('decision_scenarios')
      .update({ status: 'decided', selected_option: option })
      .eq('id', scenarioId)
      .eq('user_id', userId);

    // Future enhancement: Track if outcome matches prediction (Step 48)
  }
}
