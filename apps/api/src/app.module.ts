import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthMiddleware } from './common/middleware/auth.middleware';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { ProfilesModule } from './profiles/profiles.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RoutinesModule } from './routines/routines.module';
import { CalendarModule } from './calendar/calendar.module';
import { TasksModule } from './tasks/tasks.module';
import { MeetingsModule } from './meetings/meetings.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { ModesModule } from './modes/modes.module';
import { IntelligenceModule } from './intelligence/intelligence.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { GoalsModule } from './goals/goals.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { LifeEventsModule } from './life-events/life-events.module';
import { FinancesModule } from './finances/finances.module';
import { TravelModule } from './travel/travel.module';
import { GraphModule } from './graph/graph.module';
import { AutonomousPlanningModule } from './autonomous-planning/autonomous-planning.module';
import { BehavioralModelingModule } from './behavioral-modeling/behavioral-modeling.module';
import { AutonomyModule } from './autonomy/autonomy.module';
import { DecisionSupportModule } from './decision-support/decision-support.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 10,
    }]),
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    CommonModule,
    ProfilesModule,
    NotificationsModule,
    RoutinesModule,
    CalendarModule,
    TasksModule,
    MeetingsModule,
    SchedulingModule,
    ModesModule,
    IntelligenceModule,
    AnalyticsModule,
    GoalsModule,
    WorkspacesModule,
    LifeEventsModule,
    FinancesModule,
    TravelModule,
    GraphModule,
    AutonomousPlanningModule,
    BehavioralModelingModule,
    AutonomyModule,
    DecisionSupportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('*');
  }
}
