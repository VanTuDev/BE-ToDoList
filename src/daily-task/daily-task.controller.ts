import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DailyTaskService } from './daily-task.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../auth/current-user.decorator';

@Controller('api/daily-tasks')
@UseGuards(JwtAuthGuard)
export class DailyTaskController {
  constructor(private readonly dailyTaskService: DailyTaskService) {}

  @Get()
  async findAll(@CurrentUserId() userId: string) {
    return this.dailyTaskService.findAll(userId);
  }

  @Post()
  async create(
    @CurrentUserId() userId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.dailyTaskService.create(userId, body);
  }

  @Post('bulk')
  async createBulk(
    @CurrentUserId() userId: string,
    @Body() body: { tasks: Array<{ title: string; priority?: string }> },
  ) {
    return this.dailyTaskService.createBulk(userId, body.tasks ?? []);
  }

  @Patch(':id/toggle')
  async toggle(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.dailyTaskService.toggle(id, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.dailyTaskService.remove(id, userId);
  }
}
