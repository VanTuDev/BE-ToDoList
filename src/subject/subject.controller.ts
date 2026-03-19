import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CreateSubjectDto, UpdateSubjectDto } from './subject.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../auth/current-user.decorator';

@Controller('api/subjects')
@UseGuards(JwtAuthGuard)
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Get()
  async findAll(@CurrentUserId() userId: string) {
    return this.subjectService.findAll(userId);
  }

  @Post()
  async create(@CurrentUserId() userId: string, @Body() dto: CreateSubjectDto) {
    return this.subjectService.create(userId, dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUserId() userId: string,
    @Body() dto: UpdateSubjectDto,
  ) {
    return this.subjectService.update(id, userId, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.subjectService.remove(id, userId);
  }
}
