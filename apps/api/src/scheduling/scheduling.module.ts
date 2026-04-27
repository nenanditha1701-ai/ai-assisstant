import { Module } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { OverloadService } from './overload.service';
import { WorkloadForecastingService } from './workload-forecasting.service';
import { AutonomousOptimizationService } from './autonomous-optimization.service';
import { SchedulingListener } from './scheduling.listener';
import { SchedulingController } from './scheduling.controller';
import { AuthModule } from '../auth/auth.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { IntelligenceModule } from '../intelligence/intelligence.module';
import { LifeEventsModule } from '../life-events/life-events.module';

@Module({
  imports: [AuthModule, AnalyticsModule, IntelligenceModule, LifeEventsModule],
  providers: [
    SchedulingService,
    OverloadService,
    WorkloadForecastingService,
    AutonomousOptimizationService,
    SchedulingListener
  ],
  controllers: [SchedulingController],
  exports: [
    SchedulingService,
    OverloadService,
    WorkloadForecastingService,
    AutonomousOptimizationService
  ],
})
export class SchedulingModule {}
