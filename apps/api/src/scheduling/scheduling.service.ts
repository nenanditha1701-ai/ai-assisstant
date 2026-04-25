import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SchedulingService {
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

  async runSchedulingCycle(userId: string) {
    const adminClient = this.supabase.getAdminClient();

    // 1. Retrieve Fixed Anchors
    const { data: meetings } = await adminClient.from('meetings').select('*').eq('user_id', userId).gte('end_time', new Date().toISOString());
    const { data: routines } = await adminClient.from('routines').select('*').eq('user_id', userId);
    const { data: dayOffs } = await adminClient.from('day_off_periods').select('*').eq('user_id', userId);
    const { data: tasks } = await adminClient.from('tasks').select('*').eq('user_id', userId).eq('status', 'pending').is('deleted_at', null);

    // 2. Build blocked time map and identify free slots
    // For MVP, we'll implement a simplified logic and then enhance with Gemini
    const schedulingContext = {
      meetings,
      routines,
      dayOffs,
      pendingTasks: tasks,
      now: new Date().toISOString(),
    };

    if (this.model) {
      const prompt = `
        You are an AI Scheduling Engine. Given the following user context, propose an optimized schedule for the pending tasks.
        Constraints:
        - Respect meetings, routines (recurring), and day-off periods.
        - Prioritize tasks based on priority (1-5, 5 is highest) and deadlines.
        - Avoid overloading any single day.

        Context: ${JSON.stringify(schedulingContext)}

        Return a JSON array of objects with task_id and proposed_start_time (ISO string).
      `;

      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Parse JSON from text (handling potential markdown formatting)
        const jsonMatch = text.match(/\[.*\]/s);
        if (jsonMatch) {
          const proposedSchedule = JSON.parse(jsonMatch[0]);

          for (const item of proposedSchedule) {
            await adminClient
              .from('tasks')
              .update({ scheduled_start: item.proposed_start_time })
              .eq('id', item.task_id);
          }
          return { status: 'success', scheduled_count: proposedSchedule.length };
        }
      } catch (error) {
        console.error('AI Scheduling Error:', error);
        // Fallback to rule-based logic if Gemini fails
      }
    }

    return { status: 'failed', message: 'AI Model unavailable or error occurred' };
  }
}
