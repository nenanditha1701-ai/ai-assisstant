import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MeetingIntelligenceService {
  private model: any;

  constructor(
    private supabase: SupabaseService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }
  }

  async generateMOM(meetingId: string, transcript: string) {
    if (!this.model) return null;

    const prompt = `
      Analyze the following meeting transcript and extract structured intelligence.
      Transcript: ${transcript}

      Return JSON with:
      - summary (3-5 sentences)
      - decisions (array of {text, owner})
      - action_items (array of {title, assignee, deadline})
      - discussion_topics (array of strings)
      - unresolved_items (array of strings)
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const data = JSON.parse(response.text().match(/\{.*\}/s)[0]);

      const { data: mom } = await this.supabase.getAdminClient()
        .from('meeting_intelligence')
        .insert({
          meeting_id: meetingId,
          ...data
        })
        .select()
        .single();

      // Automatically create draft tasks for action items
      for (const item of data.action_items) {
          // Logic to find user and insert draft task would go here
      }

      return mom;
    } catch (error) {
      console.error('MOM Generation Error:', error);
      return null;
    }
  }
}
