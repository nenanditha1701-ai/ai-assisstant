import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';

@Injectable()
export class GoalProgressService {
  constructor(private supabase: SupabaseService) {}

  async calculateProgress(goalId: string) {
    const { data: goal } = await this.supabase.getClient()
      .from('goals')
      .select('*, tasks(status), goal_milestones(status)')
      .eq('id', goalId)
      .single();

    if (!goal) return 0;

    let progress = 0;
    if (goal.progress_mode === 'task-based') {
      const tasks = goal.tasks || [];
      if (tasks.length === 0) return 0;
      const completed = tasks.filter((t: any) => t.status === 'completed').length;
      progress = (completed / tasks.length) * 100;
    } else if (goal.progress_mode === 'milestone-based') {
      const milestones = goal.goal_milestones || [];
      if (milestones.length === 0) return 0;
      const completed = milestones.filter((m: any) => m.status === 'completed').length;
      progress = (completed / milestones.length) * 100;
    }

    await this.supabase.getClient()
      .from('goals')
      .update({ progress })
      .eq('id', goalId);

    return progress;
  }

  async takeSnapshot(userId: string) {
    const { data: goals } = await this.supabase.getClient()
      .from('goals')
      .select('id, progress')
      .eq('user_id', userId);

    if (!goals) return;

    const snapshots = goals.map(g => ({
      goal_id: g.id,
      user_id: userId,
      progress_percentage: g.progress || 0,
      snapshot_date: new Date().toISOString().split('T')[0],
    }));

    await this.supabase.getClient()
      .from('goal_progress_snapshots')
      .insert(snapshots);
  }
}
