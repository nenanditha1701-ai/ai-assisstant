import { Module } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { OverloadService } from './overload.service';
import { SchedulingController } from './scheduling.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [SchedulingService, OverloadService],
  controllers: [SchedulingController],
  exports: [SchedulingService, OverloadService],
})
export class SchedulingModule {}
