import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../auth/current-user.decorator';

@Controller('api/timetable')
@UseGuards(JwtAuthGuard)
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Get()
  async findAll(@CurrentUserId() userId: string) {
    return this.timetableService.findAll(userId);
  }

  @Post()
  async create(
    @CurrentUserId() userId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.timetableService.create(userId, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.timetableService.remove(id, userId);
  }
}
