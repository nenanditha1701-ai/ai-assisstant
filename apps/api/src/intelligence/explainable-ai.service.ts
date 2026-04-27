import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';

@Injectable()
export class ExplainableAIService {
  constructor(private supabase: SupabaseService) {}

  async logDecision(
    userId: string,
    decisionType: string,
    entityType: string,
    entityId: string,
    reasoning: any[],
    constraints: any = {},
    outcome: any = {}
  ) {
    const { error } = await this.supabase.getClient()
      .from('decision_logs')
      .insert({
        user_id: userId,
        decision_type: decisionType,
        entity_type: entityType,
        entity_id: entityId,
        reasoning_steps: reasoning,
        constraints_applied: constraints,
        outcome: outcome
      });

    if (error) console.error('Error logging decision:', error);
  }

  async getExplanation(decisionId: string) {
    const { data } = await this.supabase.getClient()
      .from('decision_logs')
      .select('*')
      .eq('id', decisionId)
      .single();

    return data;
  }
}
