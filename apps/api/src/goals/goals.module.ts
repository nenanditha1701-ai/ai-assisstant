import { Module } from '@nestjs/common';
import { GoalProgressService } from './goal-progress.service';
import { GoalCronService } from './goal-cron.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [GoalProgressService, GoalCronService],
  exports: [GoalProgressService],
})
export class GoalsModule {}
