import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { AIService } from '../common/services/ai.service';

@Injectable()
export class DailyBriefingService {
  constructor(
    private supabase: SupabaseService,
    private ai: AIService,
  ) {}

  async generateBriefing(userId: string) {
    const adminClient = this.supabase.getAdminClient();
    const today = new Date().toISOString().split('T')[0];

    const { data: tasks } = await adminClient.from('tasks').select('*').eq('user_id', userId).eq('scheduled_start::date', today);
    const { data: meetings } = await adminClient.from('meetings').select('*').eq('user_id', userId).gte('start_time', `${today}T00:00:00`);
    const { data: goals } = await adminClient.from('goals').select('*').eq('user_id', userId).eq('status', 'active');

    const briefingContext = { tasks, meetings, goals, today };

    const prompt = `
      Generate a professional morning briefing for the user based on the following context:
      ${JSON.stringify(briefingContext)}

      Sections:
      - Greeting
      - Schedule Overview
      - Top 3 Priorities
      - Goal Snapshot

      Return JSON with fields: "content_json" (object) and "rendered_text" (string).
      Ensure valid JSON output only.
    `;

    try {
      const briefingData = await this.ai.generateStructuredResponse(prompt);
      const { data, error } = await adminClient.from('daily_briefings').insert({
          user_id: userId,
          briefing_date: today,
          content_json: briefingData.content_json,
          rendered_text: briefingData.rendered_text,
          delivery_status: 'generated'
      }).select().single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Briefing Generation Error:', error);
      return null;
    }
  }
}
