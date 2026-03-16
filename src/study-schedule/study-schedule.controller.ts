import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { StudyScheduleService } from './study-schedule.service';

const DEMO_USER_ID = process.env.DEMO_USER_ID || 'demo-user';

@Controller('api/study-schedules')
export class StudyScheduleController {
  constructor(private readonly studyScheduleService: StudyScheduleService) {}

  @Get()
  async findAll() {
    return this.studyScheduleService.findAll(DEMO_USER_ID);
  }

  @Post()
  async create(@Body() body: Record<string, unknown>) {
    return this.studyScheduleService.create(DEMO_USER_ID, body);
  }

  @Patch(':id/toggle')
  async toggle(@Param('id') id: string) {
    return this.studyScheduleService.toggle(id, DEMO_USER_ID);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.studyScheduleService.remove(id, DEMO_USER_ID);
  }
}
