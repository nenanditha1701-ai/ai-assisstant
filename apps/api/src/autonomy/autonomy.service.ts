import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';

@Injectable()
export class AutonomyService {
  constructor(private supabase: SupabaseService) {}

  async getSettings(userId: string) {
    const { data } = await this.supabase.getClient()
      .from('autonomy_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    return data || { autonomy_level: 'advisory' };
  }

  async updateSettings(userId: string, settings: any) {
    const { data, error } = await this.supabase.getClient()
      .from('autonomy_settings')
      .upsert({ user_id: userId, ...settings })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async logAction(userId: string, action: { type: string, entityType: string, entityId: string, before: any, after: any, reasoning: string }) {
    const { data, error } = await this.supabase.getAdminClient()
      .from('autonomous_actions')
      .insert({
        user_id: userId,
        action_type: action.type,
        entity_type: action.entityType,
        entity_id: action.entityId,
        before_state: action.before,
        after_state: action.after,
        reasoning: action.reasoning
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async rollbackAction(userId: string, actionId: string) {
    const adminClient = this.supabase.getAdminClient();

    const { data: action } = await adminClient
      .from('autonomous_actions')
      .select('*')
      .eq('id', actionId)
      .eq('user_id', userId)
      .single();

    if (!action) throw new NotFoundException('Action not found');

    // Step 47: Single-step reversal using before_state
    const table = this.getTableName(action.entity_type);
    const { error } = await adminClient
      .from(table)
      .update(action.before_state)
      .eq('id', action.entity_id);

    if (error) throw error;

    // Log the rollback
    await adminClient.from('autonomous_actions').delete().eq('id', actionId);

    return { status: 'rolled_back' };
  }

  private getTableName(entityType: string): string {
    switch (entityType) {
      case 'task': return 'tasks';
      case 'goal': return 'goals';
      case 'meeting': return 'meetings';
      case 'routine': return 'routines';
      default: throw new Error(`Unknown entity type: ${entityType}`);
    }
  }
}
