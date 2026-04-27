import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { DeadlineIntelligenceService } from './deadline-intelligence.service';
import { TasksController } from './tasks.controller';
import { AuthModule } from '../auth/auth.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [AuthModule, AnalyticsModule],
  providers: [TasksService, DeadlineIntelligenceService],
  controllers: [TasksController],
  exports: [TasksService, DeadlineIntelligenceService],
})
export class TasksModule {}
