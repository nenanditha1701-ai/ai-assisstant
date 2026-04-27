import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { BehavioralAnalysisService } from '../analytics/behavioral-analysis.service';

@Injectable()
export class WorkloadForecastingService {
  constructor(
    private supabase: SupabaseService,
    private behavioral: BehavioralAnalysisService
  ) {}

  async generateForecast(userId: string, days: number = 14) {
    const adminClient = this.supabase.getAdminClient();

    const { data: tasks } = await adminClient
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .neq('status', 'completed');

    // Step 35 improvement: Fetch duration overrun factor from behavioral analytics
    // In a real system, this would be a computed metric from behavioral_events
    // For MVP, we'll assume a 1.2x multiplier if the user has a history of late tasks
    const overrunFactor = await this.getDurationOverrunFactor(userId);

    const forecasts = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const dailyTasks = tasks?.filter(t => t.deadline && t.deadline.startsWith(dateStr)) || [];

      // Apply accuracy correction (overrun factor)
      const rawTotalMinutes = dailyTasks.reduce((sum, t) => sum + (t.estimated_duration || 0), 0);
      const correctedTotalMinutes = rawTotalMinutes * overrunFactor;
      const totalHours = correctedTotalMinutes / 60;

      const utilization = totalHours / 8; // Assuming 8h work day
      let risk = 'low';
      if (utilization > 1.0) risk = 'critical';
      else if (utilization > 0.85) risk = 'high';
      else if (utilization > 0.6) risk = 'medium';

      forecasts.push({
        user_id: userId,
        forecast_date: dateStr,
        utilization_ratio: utilization,
        risk_category: risk,
        contributing_factors: {
          task_count: dailyTasks.length,
          overrun_factor_applied: overrunFactor,
          raw_minutes: rawTotalMinutes
        }
      });
    }

    const { error } = await adminClient
      .from('workload_forecasts')
      .upsert(forecasts, { onConflict: 'user_id, forecast_date' });

    if (error) console.error('Error saving forecasts:', error);
    return forecasts;
  }

  private async getDurationOverrunFactor(userId: string): Promise<number> {
    // Step 35: Historical duration overrun factor
    const { data: history } = await this.supabase.getAdminClient()
      .from('behavioral_events')
      .select('metadata')
      .eq('user_id', userId)
      .eq('event_type', 'task_completed')
      .limit(10);

    if (!history || history.length === 0) return 1.0;

    // Logic: if average delay is significant, increase factor
    const totalDelay = history.reduce((sum, event) => sum + (event.metadata?.delay || 0), 0);
    const avgDelay = totalDelay / history.length;

    if (avgDelay > 60) return 1.3; // History of 1h+ delays
    if (avgDelay > 15) return 1.15;
    return 1.05;
  }
}
