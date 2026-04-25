import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailIntelligenceService {
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }
  }

  async analyzeEmail(emailBody: string, sender: string) {
    if (!this.model) return null;

    const prompt = `
      Classify the following email and extract action items.
      Sender: ${sender}
      Body: ${emailBody}

      Return JSON with:
      - category (action_required, informational, follow_up, meeting_request, spam)
      - urgency (1-5)
      - action_items (array of {title, deadline})
      - summary (1 sentence)
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text().match(/\{.*\}/s)[0]);
    } catch (error) {
      console.error('Email Analysis Error:', error);
      return null;
    }
  }
}
