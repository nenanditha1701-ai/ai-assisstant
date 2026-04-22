import { Controller, Get, Put, Body, Req } from '@nestjs/common';
import { NotificationPreferencesService } from './notification-preferences.service';
import { Request } from 'express';

@Controller('notifications/preferences')
export class NotificationPreferencesController {
  constructor(private prefsService: NotificationPreferencesService) {}

  @Get()
  async getMyPreferences(@Req() req: Request) {
    return this.prefsService.getPreferences(req['user_id']);
  }

  @Put()
  async updateMyPreferences(@Req() req: Request, @Body() body: any) {
    return this.prefsService.updatePreferences(req['user_id'], body);
  }
}
