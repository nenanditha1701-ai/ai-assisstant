import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SupabaseService } from '../auth/supabase.service';
import { ContextStateService } from '../common/services/context-state.service';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  constructor(
    private supabase: SupabaseService,
    private contextState: ContextStateService
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { userId, type, content, urgency } = job.data;

    // Step 37 Integration: Apply contextual filters
    const context = await this.contextState.getContextState(userId);

    // Filter logic:
    // If in-meeting or high-stress, only allow 'critical' urgency
    if (context.calendarState === 'in-meeting' || context.stressLevel === 'high') {
      if (urgency !== 'critical') {
        console.log(`Suppressed non-critical notification (${type}) for user ${userId} due to ${context.calendarState}/${context.stressLevel} context`);
        return { status: 'suppressed' };
      }
    }

    // Logic for sending (SendGrid/FCM etc.) would go here
    console.log(`Dispatching ${type} notification to user ${userId}`);

    await this.supabase.getAdminClient()
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        content,
        status: 'sent',
        metadata: { context }
      });

    return { status: 'sent' };
  }
}
