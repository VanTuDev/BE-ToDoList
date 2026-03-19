import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { DataService } from './data.service';
import { SeedService } from './seed.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../auth/current-user.decorator';

@Controller('api/data')
export class DataController {
  constructor(
    private readonly dataService: DataService,
    private readonly seedService: SeedService,
  ) {}

  @Get('state')
  @UseGuards(JwtAuthGuard)
  async getFullState(@CurrentUserId() userId: string) {
    return this.dataService.getFullState(userId);
  }

  /** Seed user demo (0399604816) + profile + môn học + TKB. Chỉ thêm cho user đó, không ảnh hưởng user khác. */
  @Post('seed-demo')
  async seedDemo() {
    return this.seedService.seedDemoUser();
  }
}
