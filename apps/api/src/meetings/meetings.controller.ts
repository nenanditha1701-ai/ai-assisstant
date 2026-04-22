import { Controller, Get, Post, Body, Req, Param } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { Request } from 'express';

@Controller('meetings')
export class MeetingsController {
  constructor(private meetingsService: MeetingsService) {}

  @Get()
  async getMeetings(@Req() req: Request) {
    return this.meetingsService.getMeetings(req['user_id']);
  }

  @Post()
  async createMeeting(@Req() req: Request, @Body() body: any) {
    return this.meetingsService.createMeeting(req['user_id'], body);
  }

  @Post('sync/:provider')
  async syncExternal(@Req() req: Request, @Param('provider') provider: 'google' | 'outlook') {
    return this.meetingsService.syncExternalCalendar(req['user_id'], provider);
  }
}
