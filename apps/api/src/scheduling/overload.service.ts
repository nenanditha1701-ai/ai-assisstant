import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';

@Injectable()
export class OverloadService {
  constructor(private supabase: SupabaseService) {}

  async detectOverload(userId: string, date: string) {
    const adminClient = this.supabase.getAdminClient();

    // 1. Calculate Scheduled Duration
    const { data: tasks } = await adminClient
      .from('tasks')
      .select('id, estimated_duration')
      .eq('user_id', userId)
      .eq('scheduled_start::date', date)
      .is('deleted_at', null);

    const totalScheduledMinutes = tasks?.reduce((acc, t) => acc + (t.estimated_duration || 0), 0) || 0;

    // 2. Calculate Available Time from Routines
    const dayOfWeek = new Date(date).getDay();
    const { data: routines } = await adminClient
      .from('routines')
      .select('start_time, end_time')
      .eq('user_id', userId)
      .eq('category', 'work')
      .contains('active_days', [dayOfWeek]);

    let availableMinutes = 0;
    routines?.forEach(r => {
        const start = new Date(`${date}T${r.start_time}`);
        const end = new Date(`${date}T${r.end_time}`);
        availableMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
    });

    // 3. Subtract Meetings
    const { data: meetings } = await adminClient
      .from('meetings')
      .select('start_time, end_time')
      .eq('user_id', userId)
      .gte('start_time', `${date}T00:00:00`)
      .lte('end_time', `${date}T23:59:59`);

    meetings?.forEach(m => {
        const start = new Date(m.start_time);
        const end = new Date(m.end_time);
        availableMinutes -= (end.getTime() - start.getTime()) / (1000 * 60);
    });

    const ratio = availableMinutes > 0 ? totalScheduledMinutes / availableMinutes : 0;

    if (ratio > 0.85) {
        await adminClient.from('workload_events').insert({
            user_id: userId,
            date,
            utilization_ratio: ratio,
            tasks_flagged: tasks?.map(t => t.id) || [],
            action_taken: ratio > 1.0 ? 'overload_detected' : 'warning_issued'
        });
    }

    return { ratio, status: ratio > 1.0 ? 'overloaded' : ratio > 0.85 ? 'warning' : 'optimal' };
  }
}
