import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { Request } from 'express';

@Controller('scheduling')
export class SchedulingController {
  constructor(private schedulingService: SchedulingService) {}

  @Post('trigger')
  async triggerScheduling(@Req() req: Request) {
    return this.schedulingService.runSchedulingCycle(req['user_id']);
  }
}
