import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Injectable()
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}

  async login(email: string, pass: string) {
    // Auth operations always use adminClient or standard client without JWT
    const { data, error } = await this.supabaseService.getAdminClient().auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async logout(token: string) {
    await this.supabaseService.getAdminClient().auth.signOut();
  }

  async refreshToken(refreshToken: string) {
    const { data, error } = await this.supabaseService.getAdminClient().auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}
