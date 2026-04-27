import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SystemEvents } from '../common/events/system-events';
import { SupabaseService } from '../auth/supabase.service';

@Injectable()
export class SystemEventLogger {
  constructor(private supabase: SupabaseService) {}

  @OnEvent('**')
  async logAllEvents(payload: any, eventName: string) {
    const start = Date.now();

    // In a real system, we'd track which subscribers handled it
    // For now, we log the occurrence (Step 44)
    await this.supabase.getAdminClient()
      .from('system_events_log')
      .insert({
        event_type: eventName,
        entity_id: payload?.taskId || payload?.goalId || payload?.task?.id,
        processing_status: 'completed',
        processing_time_ms: Date.now() - start
      });
  }
}
