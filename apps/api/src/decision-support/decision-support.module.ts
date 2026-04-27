import { Module } from '@nestjs/common';
import { DecisionSupportService } from './decision-support.service';
import { AuthModule } from '../auth/auth.module';
import { SchedulingModule } from '../scheduling/scheduling.module';

@Module({
  imports: [AuthModule, SchedulingModule],
  providers: [DecisionSupportService],
  exports: [DecisionSupportService],
})
export class DecisionSupportModule {}
