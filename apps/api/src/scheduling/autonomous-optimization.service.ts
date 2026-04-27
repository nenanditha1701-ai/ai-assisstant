import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { ExplainableAIService } from '../intelligence/explainable-ai.service';

@Injectable()
export class AutonomousOptimizationService {
  constructor(
    private supabase: SupabaseService,
    private explainable: ExplainableAIService
  ) {}

  async optimizeSchedule(userId: string) {
    const { data: settings } = await this.supabase.getClient()
      .from('autonomy_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    const autonomyLevel = settings?.autonomy_level || 'advisory';

    if (autonomyLevel === 'advisory') {
      return { status: 'skipped', reason: 'Advisory mode only' };
    }

    // Pass 1: Gap Detection & Fill
    // Pass 2: Energy Pattern Alignment
    // ... logic would go here

    const optimizationResult = {
      taskId: 'some-task-uuid',
      oldSlot: { start: '2026-04-24T14:00:00Z' },
      newSlot: { start: '2026-04-24T10:00:00Z' },
      pass: 'energy-alignment',
      reason: 'Moving high-priority task to peak productivity window (9-11 AM).'
    };

    // Human-in-the-loop logic:
    // Minor adjustments (< 2h) applied silently if level is 'autonomous'
    // Significant moves (> 2h or different day) always require review unless 'autonomous' and specifically allowed

    const isSignificant = true; // Simplified for MVP
    const status = (autonomyLevel === 'autonomous' && !isSignificant) ? 'applied' : 'pending_review';

    await this.logOptimization(userId, optimizationResult, status);

    if (status === 'applied') {
      // Actually update the task in DB
      await this.supabase.getClient()
        .from('tasks')
        .update({ scheduled_start: optimizationResult.newSlot.start })
        .eq('id', optimizationResult.taskId);
    }

    return { status, optimization: optimizationResult };
  }

  async undoOptimization(userId: string, logId: string) {
    const { data: log } = await this.supabase.getClient()
      .from('schedule_optimization_logs')
      .select('*')
      .eq('id', logId)
      .eq('user_id', userId)
      .single();

    if (!log || log.status !== 'applied') return;

    await this.supabase.getClient()
      .from('tasks')
      .update({ scheduled_start: log.previous_slot.start })
      .eq('id', log.task_id);

    await this.supabase.getClient()
      .from('schedule_optimization_logs')
      .update({ status: 'reverted' })
      .eq('id', logId);
  }

  private async logOptimization(userId: string, result: any, status: string) {
    await this.supabase.getClient()
      .from('schedule_optimization_logs')
      .insert({
        user_id: userId,
        task_id: result.taskId,
        previous_slot: result.oldSlot,
        new_slot: result.newSlot,
        optimization_pass: result.pass,
        reason: result.reason,
        status
      });

    // Also log to autonomous_actions for the audit trail
    await this.supabase.getClient()
      .from('autonomous_actions')
      .insert({
        user_id: userId,
        action_type: 'schedule_optimization',
        entity_type: 'task',
        entity_id: result.taskId,
        reasoning: result.reason,
        before_state: result.oldSlot,
        after_state: result.newSlot
      });
  }
}
