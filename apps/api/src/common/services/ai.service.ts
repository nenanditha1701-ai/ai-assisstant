import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }
  }

  async generateStructuredResponse(prompt: string, retries: number = 3): Promise<any> {
    if (!this.model) {
      throw new InternalServerErrorException('AI Model not initialized');
    }

    let lastError: any;
    for (let i = 0; i < retries; i++) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Robust JSON extraction
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (e) {
            lastError = e;
            console.warn(`JSON Parse attempt ${i + 1} failed:`, e.message);
          }
        } else {
          lastError = new Error('No JSON object found in AI response');
        }
      } catch (error) {
        lastError = error;
        console.error(`AI Request attempt ${i + 1} failed:`, error.message);
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }

    throw new InternalServerErrorException(`AI failed after ${retries} attempts: ${lastError?.message}`);
  }
}
