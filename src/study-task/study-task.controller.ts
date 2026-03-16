import { Controller, Get, Patch, Param } from '@nestjs/common';
import { StudyTaskService } from './study-task.service';

const DEMO_USER_ID = process.env.DEMO_USER_ID || 'demo-user';

@Controller('api/study-tasks')
export class StudyTaskController {
  constructor(private readonly studyTaskService: StudyTaskService) {}

  @Get()
  async findAll() {
    return this.studyTaskService.findAll(DEMO_USER_ID);
  }

  @Patch(':id/toggle')
  async toggle(@Param('id') id: string) {
    return this.studyTaskService.toggle(id, DEMO_USER_ID);
  }
}
