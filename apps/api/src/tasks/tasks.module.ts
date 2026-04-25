import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { DeadlineIntelligenceService } from './deadline-intelligence.service';
import { TasksController } from './tasks.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [TasksService, DeadlineIntelligenceService],
  controllers: [TasksController],
  exports: [TasksService, DeadlineIntelligenceService],
})
export class TasksModule {}
