import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Injectable()
export class AuditService {
  constructor(private supabase: SupabaseService) {}

  async logEvent(userId: string, entityType: string, entityId: string, action: string, oldValue: any = null, newValue: any = null, ipAddress: string = null) {
    await this.supabase.getClient().from('audit_logs').insert({
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
      action,
      old_value: oldValue,
      new_value: newValue,
      ip_address: ipAddress,
    });
  }
}
