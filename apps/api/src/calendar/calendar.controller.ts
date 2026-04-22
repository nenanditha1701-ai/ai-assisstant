import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { Request } from 'express';

@Controller('calendar')
export class CalendarController {
  constructor(private calendarService: CalendarService) {}

  @Get('day-off')
  async getDayOffPeriods(@Req() req: Request) {
    return this.calendarService.getDayOffPeriods(req['user_id']);
  }

  @Post('day-off')
  async createDayOffPeriod(@Req() req: Request, @Body() body: any) {
    return this.calendarService.createDayOffPeriod(req['user_id'], body);
  }
}
