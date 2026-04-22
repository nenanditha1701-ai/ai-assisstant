import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';

@Injectable()
export class MeetingsService {
  constructor(private supabase: SupabaseService) {}

  async getMeetings(userId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('meetings')
      .select('*');
    if (error) throw error;
    return data;
  }

  async createMeeting(userId: string, meetingData: any) {
    // Conflict Detection (Step 11)
    const hasConflict = await this.checkConflicts(userId, meetingData.start_time, meetingData.end_time);
    if (hasConflict) {
      throw new BadRequestException('Meeting time conflicts with an existing event or routine');
    }

    const { data, error } = await this.supabase.getClient()
      .from('meetings')
      .insert({ ...meetingData, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  private async checkConflicts(userId: string, start: string, end: string): Promise<boolean> {
    const startTime = new Date(start);
    const endTime = new Date(end);

    // 1. Check other meetings
    const { data: meetings } = await this.supabase.getClient()
      .from('meetings')
      .select('id')
      .filter('start_time', 'lt', endTime.toISOString())
      .filter('end_time', 'gt', startTime.toISOString());

    if (meetings && meetings.length > 0) return true;

    // 2. Check Routine blocks (Step 11 requirement)
    // Routines are stored with TIME (HH:MM) and active_days
    const dayOfWeek = startTime.getDay(); // 0-6
    const timeStr = startTime.toTimeString().split(' ')[0]; // HH:MM:SS
    const endTimeStr = endTime.toTimeString().split(' ')[0];

    const { data: routines } = await this.supabase.getClient()
      .from('routines')
      .select('id, start_time, end_time, active_days')
      .contains('active_days', [dayOfWeek]);

    if (routines) {
      for (const routine of routines) {
        // Simple string comparison for times within the same day
        if (routine.start_time < endTimeStr && routine.end_time > timeStr) {
          return true;
        }
      }
    }

    return false;
  }

  async syncExternalCalendar(userId: string, provider: 'google' | 'outlook') {
    console.log(`Syncing with ${provider} for user ${userId}`);
    return { status: 'success', synced_events: 0 };
  }
}
