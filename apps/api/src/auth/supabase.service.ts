import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class SupabaseService {
  private client: SupabaseClient;
  private adminClient: SupabaseClient;

  constructor(@Inject(REQUEST) private readonly request: Request) {
    // Admin client (bypasses RLS) - only for system operations
    this.adminClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  getClient() {
    if (this.client) return this.client;

    const authHeader = this.request.headers['authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      // User client (respects RLS)
      this.client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
      return this.client;
    }

    return this.adminClient;
  }

  getAdminClient() {
    return this.adminClient;
  }
}
