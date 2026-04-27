import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { LifeEventsService } from './life-events.service';

@Controller('life-events')
export class LifeEventsController {
  constructor(private lifeEventsService: LifeEventsService) {}

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    return this.lifeEventsService.createLifeEvent(req.user.id, body);
  }

  @Get()
  async findAll(@Req() req: any) {
    const { data, error } = await this.lifeEventsService['supabase'].getClient()
      .from('life_events')
      .select('*')
      .eq('user_id', req.user.id);

    if (error) throw error;
    return data;
  }
}
