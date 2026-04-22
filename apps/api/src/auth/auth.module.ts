import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseService } from './supabase.service';
import { AuditService } from './audit.service';

@Module({
  providers: [AuthService, SupabaseService, AuditService],
  controllers: [AuthController],
  exports: [SupabaseService, AuditService],
})
export class AuthModule {}
