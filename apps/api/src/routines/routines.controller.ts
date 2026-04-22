import { Controller, Get, Post, Put, Body, Req, Param } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { Request } from 'express';

@Controller('routines')
export class RoutinesController {
  constructor(private routinesService: RoutinesService) {}

  @Get()
  async getRoutines(@Req() req: Request) {
    return this.routinesService.getRoutines(req['user_id']);
  }

  @Post()
  async createRoutine(@Req() req: Request, @Body() body: any) {
    return this.routinesService.createRoutine(req['user_id'], body);
  }

  @Put(':id')
  async updateRoutine(@Req() req: Request, @Param('id') id: string, @Body() body: any) {
    return this.routinesService.updateRoutine(req['user_id'], id, body);
  }

  @Post(':id/exceptions')
  async createException(@Param('id') id: string, @Body() body: any) {
    return this.routinesService.createException(id, body);
  }
}
