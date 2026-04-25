import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../auth/supabase.service';

@Injectable()
export class DeadlineIntelligenceService {
  constructor(private supabase: SupabaseService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async checkMissedDeadlines() {
    const adminClient = this.supabase.getAdminClient();
    const now = new Date().toISOString();

    // 1. Query missed tasks
    const { data: missedTasks } = await adminClient
      .from('tasks')
      .select('id, user_id, deadline, title, priority')
      .lt('deadline', now)
      .not('status', 'in', '("completed","cancelled")')
      .is('deleted_at', null);

    if (!missedTasks) return;

    for (const task of missedTasks) {
      // 2. Diagnose reason (simplified for MVP)
      const reason = 'unscheduled_or_overload';

      // 3. Log the miss
      await adminClient.from('missed_tasks_log').insert({
        user_id: task.user_id,
        task_id: task.id,
        original_deadline: task.deadline,
        reason_category: reason
      });

      // 4. Propose corrective action: escalate priority
      const newPriority = Math.min(task.priority + 1, 5);
      await adminClient.from('tasks').update({
        priority: newPriority,
        status: 'deferred'
      }).eq('id', task.id);

      console.log(`Task ${task.id} deadline missed. Priority escalated to ${newPriority}.`);
    }
  }
}
