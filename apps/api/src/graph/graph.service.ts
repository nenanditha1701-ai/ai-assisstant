import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';

@Injectable()
export class GraphService {
  constructor(private supabase: SupabaseService) {}

  async createRelationship(userId: string, source: any, target: any, type: string, metadata: any = {}) {
    const { data, error } = await this.supabase.getClient()
      .from('graph_relationships')
      .insert({
        user_id: userId,
        source_entity_type: source.type,
        source_entity_id: source.id,
        target_entity_type: target.type,
        target_entity_id: target.id,
        relationship_type: type,
        metadata
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getDownstreamImpact(entityId: string, entityType: string) {
    // Multi-hop traversal (Step 43)
    // 1. Find all entities that depend_on or are blocked_by this entity
    const { data: direct } = await this.supabase.getClient()
      .from('graph_relationships')
      .select('*')
      .eq('target_entity_id', entityId)
      .eq('target_entity_type', entityType);

    return direct || [];
  }

  async getGoalConnections(goalId: string) {
    // Example: Find what funds this goal or what tasks contribute to it
    const { data } = await this.supabase.getClient()
      .from('graph_relationships')
      .select('*')
      .or(`source_entity_id.eq.${goalId},target_entity_id.eq.${goalId}`);

    return data || [];
  }
}
