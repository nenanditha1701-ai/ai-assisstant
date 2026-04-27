import { Module } from '@nestjs/common';
import { AutonomyService } from './autonomy.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [AutonomyService],
  exports: [AutonomyService],
})
export class AutonomyModule {}
