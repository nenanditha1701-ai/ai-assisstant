import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';

@Injectable()
export class NotificationPreferencesService {
  constructor(private supabase: SupabaseService) {}

  async getPreferences(userId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      return this.createDefaultPreferences(userId);
    }
    return data;
  }

  async createDefaultPreferences(userId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('notification_preferences')
      .insert({
        user_id: userId,
        enabled_channels: ['email', 'in-app'],
        frequency_mode: 'instant',
        quiet_hours_start: '22:00',
        quiet_hours_end: '07:00',
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updatePreferences(userId: string, updateData: any) {
    const { data, error } = await this.supabase.getClient()
      .from('notification_preferences')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
