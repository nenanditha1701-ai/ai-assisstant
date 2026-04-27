import { Module } from '@nestjs/common';
import { AutonomousPlanningEngine } from './autonomous-planning.engine';
import { AuthModule } from '../auth/auth.module';
import { SchedulingModule } from '../scheduling/scheduling.module';

@Module({
  imports: [AuthModule, SchedulingModule],
  providers: [AutonomousPlanningEngine],
  exports: [AutonomousPlanningEngine],
})
export class AutonomousPlanningModule {}
