import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationPreferencesService } from './notification-preferences.service';
import { NotificationPreferencesController } from './notification-preferences.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  providers: [NotificationPreferencesService],
  controllers: [NotificationPreferencesController],
  exports: [NotificationPreferencesService],
})
export class NotificationsModule {}
