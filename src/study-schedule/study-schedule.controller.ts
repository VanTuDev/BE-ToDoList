import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { StudyScheduleService } from './study-schedule.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../auth/current-user.decorator';

@Controller('api/study-schedules')
@UseGuards(JwtAuthGuard)
export class StudyScheduleController {
  constructor(private readonly studyScheduleService: StudyScheduleService) {}

  @Get()
  async findAll(@CurrentUserId() userId: string) {
    return this.studyScheduleService.findAll(userId);
  }

  @Post()
  async create(
    @CurrentUserId() userId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.studyScheduleService.create(userId, body);
  }

  @Patch(':id/toggle')
  async toggle(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.studyScheduleService.toggle(id, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.studyScheduleService.remove(id, userId);
  }
}
