import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DailyBriefingService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private supabase: SupabaseService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }
  }

  async generateBriefing(userId: string) {
    const adminClient = this.supabase.getAdminClient();
    const today = new Date().toISOString().split('T')[0];

    // 1. Aggregate Data
    const { data: tasks } = await adminClient.from('tasks').select('*').eq('user_id', userId).eq('scheduled_start::date', today);
    const { data: meetings } = await adminClient.from('meetings').select('*').eq('user_id', userId).gte('start_time', `${today}T00:00:00`);
    const { data: goals } = await adminClient.from('goals').select('*').eq('user_id', userId).eq('status', 'active');

    const briefingContext = { tasks, meetings, goals, today };

    if (this.model) {
      const prompt = `
        Generate a professional morning briefing for the user based on the following context:
        ${JSON.stringify(briefingContext)}

        Sections:
        - Greeting
        - Schedule Overview
        - Top 3 Priorities
        - Goal Snapshot

        Return JSON with fields: content_json (structured) and rendered_text (plain text).
      `;

      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{.*\}/s);

        if (jsonMatch) {
            const briefingData = JSON.parse(jsonMatch[0]);
            const { data, error } = await adminClient.from('daily_briefings').insert({
                user_id: userId,
                briefing_date: today,
                content_json: briefingData.content_json,
                rendered_text: briefingData.rendered_text,
                delivery_status: 'generated'
            }).select().single();

            return data;
        }
      } catch (error) {
        console.error('Briefing Generation Error:', error);
      }
    }

    return null;
  }
}
