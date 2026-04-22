import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';

@Injectable()
export class CalendarService {
  constructor(private supabase: SupabaseService) {}

  async getDayOffPeriods(userId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('day_off_periods')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }

  async createDayOffPeriod(userId: string, periodData: any) {
    const { data, error } = await this.supabase.getClient()
      .from('day_off_periods')
      .insert({ ...periodData, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
