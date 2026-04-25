import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';

@Injectable()
export class ModesService {
  constructor(private supabase: SupabaseService) {}

  async getActiveMode(userId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('user_modes')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
       return this.switchMode(userId, 'personal');
    }
    return data;
  }

  async switchMode(userId: string, mode: 'work' | 'personal' | 'focus', durationMinutes?: number) {
    const autoEndAt = durationMinutes ? new Date(Date.now() + durationMinutes * 60000).toISOString() : null;

    const { data, error } = await this.supabase.getAdminClient()
      .from('user_modes')
      .upsert({
        user_id: userId,
        active_mode: mode,
        activated_at: new Date().toISOString(),
        auto_end_at: autoEndAt,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
