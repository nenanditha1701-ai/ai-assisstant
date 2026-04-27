import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { DailyBriefingService } from './daily-briefing.service';
import { ContextStateService } from '../common/services/context-state.service';

@Controller('intelligence')
export class DailyBriefingController {
  constructor(
    private briefingService: DailyBriefingService,
    private contextState: ContextStateService
  ) {}

  @Post('briefing')
  async generate(@Req() req: any) {
    return this.briefingService.generateBriefing(req.user.id);
  }

  @Get('context')
  async getContext(@Req() req: any) {
    return this.contextState.getContextState(req.user.id);
  }
}
