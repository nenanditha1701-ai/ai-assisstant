import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingRecordingService } from './meeting-recording.service';
import { MeetingsController } from './meetings.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [MeetingsService, MeetingRecordingService],
  controllers: [MeetingsController],
  exports: [MeetingsService, MeetingRecordingService],
})
export class MeetingsModule {}
