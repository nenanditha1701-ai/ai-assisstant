import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { ModesService } from './modes.service';
import { Request } from 'express';

@Controller('modes')
export class ModesController {
  constructor(private modesService: ModesService) {}

  @Get('active')
  async getActiveMode(@Req() req: Request) {
    return this.modesService.getActiveMode(req['user_id']);
  }

  @Post('switch')
  async switchMode(@Req() req: Request, @Body() body: any) {
    return this.modesService.switchMode(req['user_id'], body.mode, body.duration);
  }
}
