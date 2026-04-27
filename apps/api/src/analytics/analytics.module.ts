import { Module } from '@nestjs/common';
import { BehavioralAnalysisService } from './behavioral-analysis.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [BehavioralAnalysisService],
  exports: [BehavioralAnalysisService],
})
export class AnalyticsModule {}
