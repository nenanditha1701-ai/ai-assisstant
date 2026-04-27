import { Module } from '@nestjs/common';
import { DailyBriefingService } from './daily-briefing.service';
import { MeetingIntelligenceService } from './meeting-intelligence.service';
import { EmailIntelligenceService } from './email-intelligence.service';
import { DocumentIntelligenceService } from './document-intelligence.service';
import { MemoryService } from './memory.service';
import { ExplainableAIService } from './explainable-ai.service';
import { DailyBriefingController } from './daily-briefing.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [
    DailyBriefingService,
    MeetingIntelligenceService,
    EmailIntelligenceService,
    DocumentIntelligenceService,
    MemoryService,
    ExplainableAIService,
  ],
  controllers: [DailyBriefingController],
  exports: [
    DailyBriefingService,
    MeetingIntelligenceService,
    EmailIntelligenceService,
    DocumentIntelligenceService,
    MemoryService,
    ExplainableAIService,
  ],
})
export class IntelligenceModule {}
