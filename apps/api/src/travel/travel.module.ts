import { Module } from '@nestjs/common';
import { TravelService } from './travel.service';
import { AuthModule } from '../auth/auth.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [AuthModule, TasksModule],
  providers: [TravelService],
  exports: [TravelService],
})
export class TravelModule {}
