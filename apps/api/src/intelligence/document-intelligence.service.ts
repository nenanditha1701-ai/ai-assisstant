import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DocumentIntelligenceService {
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

  async processDocument(documentId: string, textContent: string) {
    if (!this.model) return null;

    const prompt = `
      Analyze the following document content and extract key information.
      Content: ${textContent}

      Return JSON with:
      - summary (3-5 sentences)
      - key_facts (array of strings)
      - deadlines (array of ISO dates)
      - suggested_tasks (array of strings)
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const data = JSON.parse(response.text().match(/\{.*\}/s)[0]);

      const adminClient = this.supabase.getAdminClient();

      // Update document summary
      await adminClient
        .from('documents')
        .update({
            summary: data.summary,
            processing_status: 'completed'
        })
        .eq('id', documentId);

      // Save metadata
      await adminClient
        .from('document_metadata')
        .insert({
          document_id: documentId,
          extracted_data: data
        });

      return data;
    } catch (error) {
      console.error('Document Processing Error:', error);
      return null;
    }
  }

  async linkDocument(documentId: string, entityType: string, entityId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('document_links')
      .insert({
        document_id: documentId,
        entity_type: entityType,
        entity_id: entityId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
