import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';

@Injectable()
export class MemoryService {
  constructor(private supabase: SupabaseService) {}

  async addMemory(userId: string, content: string, type: string, source: string, sourceId?: string) {
    const { data, error } = await this.supabase.getAdminClient()
      .from('context_memory')
      .insert({
        user_id: userId,
        content,
        memory_type: type,
        source,
        source_id: sourceId,
        relevance_score: 1.0
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getRelevantMemories(userId: string, contextTags: string[], limit: number = 5) {
    // Simplified relevance retrieval
    const { data, error } = await this.supabase.getClient()
      .from('context_memory')
      .select('*')
      .eq('user_id', userId)
      .order('relevance_score', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Update access count and last accessed for retrieved memories
    if (data) {
        const ids = data.map(m => m.id);
        await this.supabase.getAdminClient()
          .from('context_memory')
          .update({
            access_count: 1, // This should be an increment in a real SQL query
            last_accessed_at: new Date().toISOString()
          })
          .in('id', ids);
    }

    return data;
  }
}
