import { Controller, Post, Req, Get, Param } from '@nestjs/common';
import { DailyBriefingService } from './daily-briefing.service';
import { Request } from 'express';

@Controller('intelligence/briefing')
export class DailyBriefingController {
  constructor(private briefingService: DailyBriefingService) {}

  @Post('generate')
  async triggerBriefing(@Req() req: Request) {
    return this.briefingService.generateBriefing(req['user_id']);
  }
}
