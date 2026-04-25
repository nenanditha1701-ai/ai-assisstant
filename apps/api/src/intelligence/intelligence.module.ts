import { Module } from '@nestjs/common';
import { DailyBriefingService } from './daily-briefing.service';
import { MeetingIntelligenceService } from './meeting-intelligence.service';
import { MemoryService } from './memory.service';
import { EmailIntelligenceService } from './email-intelligence.service';
import { DocumentIntelligenceService } from './document-intelligence.service';
import { DailyBriefingController } from './daily-briefing.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [
    DailyBriefingService,
    MeetingIntelligenceService,
    MemoryService,
    EmailIntelligenceService,
    DocumentIntelligenceService
  ],
  controllers: [DailyBriefingController],
  exports: [
    DailyBriefingService,
    MeetingIntelligenceService,
    MemoryService,
    EmailIntelligenceService,
    DocumentIntelligenceService
  ],
})
export class IntelligenceModule {}
