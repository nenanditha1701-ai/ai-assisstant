import { Controller, Get, Post, Put, Delete, Body, Req, Param, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Request } from 'express';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  async getTasks(@Req() req: Request, @Query() query: any) {
    return this.tasksService.getTasks(req['user_id'], query);
  }

  @Post()
  async createTask(@Req() req: Request, @Body() body: any) {
    return this.tasksService.createTask(req['user_id'], body);
  }

  @Put(':id')
  async updateTask(@Req() req: Request, @Param('id') id: string, @Body() body: any) {
    return this.tasksService.updateTask(req['user_id'], id, body);
  }

  @Delete(':id')
  async deleteTask(@Req() req: Request, @Param('id') id: string) {
    return this.tasksService.softDeleteTask(req['user_id'], id);
  }

  @Post(':id/dependencies')
  async addDependency(@Param('id') id: string, @Body() body: any) {
    return this.tasksService.addDependency(id, body.depends_on_task_id, body.dependency_type);
  }
}
