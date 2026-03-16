import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CreateSubjectDto, UpdateSubjectDto } from './subject.dto';
const DEMO_USER_ID = process.env.DEMO_USER_ID || 'demo-user';

@Controller('api/subjects')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Get()
  async findAll() {
    return this.subjectService.findAll(DEMO_USER_ID);
  }

  @Post()
  async create(@Body() dto: CreateSubjectDto) {
    return this.subjectService.create(DEMO_USER_ID, dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    return this.subjectService.update(id, DEMO_USER_ID, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.subjectService.remove(id, DEMO_USER_ID);
  }
}
