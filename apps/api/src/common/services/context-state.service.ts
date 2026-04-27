import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../auth/supabase.service';
import { RedisService } from './redis.service';

export interface ContextState {
  userId: string;
  activeMode: 'work' | 'personal' | 'focus';
  workloadUtilization: number;
  calendarState: 'free' | 'in-meeting' | 'focus-session';
  stressLevel: 'low' | 'medium' | 'high';
  lastUpdated: string;
}

@Injectable()
export class ContextStateService {
  private readonly CONTEXT_KEY_PREFIX = 'user_context:';

  constructor(
    private supabase: SupabaseService,
    private redis: RedisService
  ) {}

  async getContextState(userId: string): Promise<ContextState> {
    const cached = await this.redis.get(`${this.CONTEXT_KEY_PREFIX}${userId}`);
    if (cached) return cached;

    return this.refreshContextState(userId);
  }

  async refreshContextState(userId: string): Promise<ContextState> {
    const adminClient = this.supabase.getAdminClient();

    // 1. Fetch Mode
    const { data: modeData } = await adminClient
      .from('user_modes')
      .select('mode')
      .eq('user_id', userId)
      .single();

    // 2. Fetch Workload (today)
    const today = new Date().toISOString().split('T')[0];
    const { data: workload } = await adminClient
      .from('workload_events')
      .select('utilization_ratio')
      .eq('user_id', userId)
      .eq('date', today)
      .order('created_at', { ascending: false })
      .limit(1);

    // 3. Fetch current meeting status
    const now = new Date().toISOString();
    const { data: currentMeetings } = await adminClient
      .from('meetings')
      .select('id')
      .eq('user_id', userId)
      .lte('start_time', now)
      .gte('end_time', now);

    const context: ContextState = {
      userId,
      activeMode: (modeData?.mode as any) || 'work',
      workloadUtilization: workload?.[0]?.utilization_ratio || 0,
      calendarState: currentMeetings?.length ? 'in-meeting' : 'free',
      stressLevel: this.calculateStress(workload?.[0]?.utilization_ratio || 0),
      lastUpdated: new Date().toISOString()
    };

    await this.redis.set(`${this.CONTEXT_KEY_PREFIX}${userId}`, context, 900); // 15 min TTL (Step 37)
    return context;
  }

  private calculateStress(utilization: number): 'low' | 'medium' | 'high' {
    if (utilization > 1.0) return 'high';
    if (utilization > 0.8) return 'medium';
    return 'low';
  }
}
