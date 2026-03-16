import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { DailyTaskService } from './daily-task.service';

const DEMO_USER_ID = process.env.DEMO_USER_ID || 'demo-user';

@Controller('api/daily-tasks')
export class DailyTaskController {
  constructor(private readonly dailyTaskService: DailyTaskService) {}

  @Get()
  async findAll() {
    return this.dailyTaskService.findAll(DEMO_USER_ID);
  }

  @Post()
  async create(@Body() body: Record<string, unknown>) {
    return this.dailyTaskService.create(DEMO_USER_ID, body);
  }

  @Post('bulk')
  async createBulk(
    @Body() body: { tasks: Array<{ title: string; priority?: string }> },
  ) {
    return this.dailyTaskService.createBulk(DEMO_USER_ID, body.tasks ?? []);
  }

  @Patch(':id/toggle')
  async toggle(@Param('id') id: string) {
    return this.dailyTaskService.toggle(id, DEMO_USER_ID);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.dailyTaskService.remove(id, DEMO_USER_ID);
  }
}
