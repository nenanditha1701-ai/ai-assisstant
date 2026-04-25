import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { NotificationPreferencesService } from './notification-preferences.service';

@Processor('notifications')
@Injectable()
export class NotificationsProcessor extends WorkerHost {
  constructor(
    private supabase: SupabaseService,
    private prefsService: NotificationPreferencesService
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { userId, eventType, content, urgency } = job.data;
    const adminClient = this.supabase.getAdminClient();

    // 1. Get Preferences
    const prefs = await this.prefsService.getPreferences(userId);

    // 2. Filter by Quiet Hours and Enabled Channels
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const isQuietHours = timeStr >= prefs.quiet_hours_start || timeStr <= prefs.quiet_hours_end;

    if (isQuietHours && urgency !== 'Critical') {
       console.log(`Notification suppressed for user ${userId} due to quiet hours.`);
       return { status: 'suppressed', reason: 'quiet_hours' };
    }

    // 3. Dispatch to enabled channels (Simplified for Phase 2)
    for (const channel of prefs.enabled_channels) {
       console.log(`Dispatching ${eventType} via ${channel} to user ${userId}: ${content}`);

       // Log delivery attempt
       await adminClient.from('notifications').insert({
         user_id: userId,
         event_type: eventType,
         channel: channel,
         status: 'sent',
         delivery_log: { job_id: job.id, urgency }
       });
    }

    return { status: 'success' };
  }
}
