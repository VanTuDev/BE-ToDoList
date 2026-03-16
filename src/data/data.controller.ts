import { Controller, Get, Post } from '@nestjs/common';
import { DataService } from './data.service';
import { SeedService } from './seed.service';

@Controller('api/data')
export class DataController {
  constructor(
    private readonly dataService: DataService,
    private readonly seedService: SeedService,
  ) {}

  @Get('state')
  async getFullState() {
    const demoUserId = process.env.DEMO_USER_ID || 'demo-user';
    return this.dataService.getFullState(demoUserId);
  }

  /** Seed user demo (0399604816) + profile + môn học + TKB. Chỉ thêm cho user đó, không ảnh hưởng user khác. */
  @Post('seed-demo')
  async seedDemo() {
    return this.seedService.seedDemoUser();
  }
}
