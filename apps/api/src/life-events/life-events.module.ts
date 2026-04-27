import { Module } from '@nestjs/common';
import { LifeEventsService } from './life-events.service';
import { LifeEventsController } from './life-events.controller';
import { AuthModule } from '../auth/auth.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [AuthModule, TasksModule],
  providers: [LifeEventsService],
  controllers: [LifeEventsController],
  exports: [LifeEventsService],
})
export class LifeEventsModule {}
