import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { LifeEventsService } from '../life-events/life-events.service';

@Injectable()
export class OverloadService {
  constructor(
    private supabase: SupabaseService,
    private lifeEvents: LifeEventsService,
  ) {}

  async calculateUtilization(userId: string, date: string) {
    const adminClient = this.supabase.getAdminClient();

    // 1. Get total scheduled task duration
    const { data: tasks } = await adminClient
      .from('tasks')
      .select('estimated_duration')
      .eq('user_id', userId)
      .eq('scheduled_start::date', date)
      .is('deleted_at', null);

    const taskMinutes = tasks?.reduce((sum, t) => sum + (t.estimated_duration || 0), 0) || 0;

    // 2. Get available working time from routines
    const { data: routines } = await adminClient
      .from('routines')
      .select('*')
      .eq('user_id', userId)
      .eq('category', 'work');

    // Simple availability calculation for MVP
    let availableMinutes = 480; // Default 8 hours

    // 3. Step 42: Apply reduced capacity for active life events
    const activeEvents = await this.lifeEvents.getActiveLifeEvents(userId);
    if (activeEvents.length > 0) {
      // Reduce capacity by 25% if managing a major transition
      availableMinutes = availableMinutes * 0.75;
    }

    const ratio = taskMinutes / availableMinutes;
    return { ratio, taskMinutes, availableMinutes };
  }

  async checkOverload(userId: string, date: string) {
    const { ratio, taskMinutes } = await this.calculateUtilization(userId, date);

    if (ratio > 1.0) {
      await this.supabase.getAdminClient()
        .from('workload_events')
        .insert({
          user_id: userId,
          date,
          utilization_ratio: ratio,
          action_taken: 'Overload detected'
        });

      return { status: 'overloaded', ratio };
    }

    return { status: 'ok', ratio };
  }
}
