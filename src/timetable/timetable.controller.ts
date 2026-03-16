import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { TimetableService } from './timetable.service';
const DEMO_USER_ID = process.env.DEMO_USER_ID || 'demo-user';

@Controller('api/timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Get()
  async findAll() {
    return this.timetableService.findAll(DEMO_USER_ID);
  }

  @Post()
  async create(@Body() body: Record<string, unknown>) {
    return this.timetableService.create(DEMO_USER_ID, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.timetableService.remove(id, DEMO_USER_ID);
  }
}
