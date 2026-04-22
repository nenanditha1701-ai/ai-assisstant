import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';

@Injectable()
export class RoutinesService {
  constructor(private supabase: SupabaseService) {}

  async getRoutines(userId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('routines')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }

  async createRoutine(userId: string, routineData: any) {
    const { data, error } = await this.supabase.getClient()
      .from('routines')
      .insert({ ...routineData, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateRoutine(userId: string, routineId: string, updateData: any) {
    const { data, error } = await this.supabase.getClient()
      .from('routines')
      .update(updateData)
      .eq('id', routineId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async createException(routineId: string, exceptionData: any) {
    const { data, error } = await this.supabase.getClient()
      .from('routine_exceptions')
      .insert({ ...exceptionData, routine_id: routineId })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
