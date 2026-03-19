import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { StudyTaskService } from './study-task.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../auth/current-user.decorator';

@Controller('api/study-tasks')
@UseGuards(JwtAuthGuard)
export class StudyTaskController {
  constructor(private readonly studyTaskService: StudyTaskService) {}

  @Get()
  async findAll(@CurrentUserId() userId: string) {
    return this.studyTaskService.findAll(userId);
  }

  @Patch(':id/toggle')
  async toggle(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.studyTaskService.toggle(id, userId);
  }
}
