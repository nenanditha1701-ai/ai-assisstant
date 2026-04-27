import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';

@Injectable()
export class BehavioralAnalysisService {
  constructor(private supabase: SupabaseService) {}

  async logEvent(userId: string, eventType: string, entityType?: string, entityId?: string, metadata: any = {}) {
    const { error } = await this.supabase.getClient()
      .from('behavioral_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        entity_type: entityType,
        entity_id: entityId,
        metadata,
      });

    if (error) console.error('Error logging behavioral event:', error);
  }

  async getInsights(userId: string) {
    // In a real system, this would involve complex SQL or AI processing
    // For now, returning rule-based summaries
    const { data: events } = await this.supabase.getClient()
      .from('behavioral_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    return this.generateRuleBasedInsights(events || []);
  }

  private generateRuleBasedInsights(events: any[]) {
    // Dummy insights for the MVP pass
    return [
      { text: "You complete 80% of tasks when scheduled before 11 AM." },
      { text: "Rescheduling frequency has increased by 15% this week." }
    ];
  }
}
