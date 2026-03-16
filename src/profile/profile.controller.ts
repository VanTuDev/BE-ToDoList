import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('api/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile() {
    const userId = process.env.DEMO_USER_ID || 'demo-user';
    return this.profileService.getOrCreate(userId);
  }

  @Patch()
  async updateProfile(@Body() body: Record<string, unknown>) {
    const userId = process.env.DEMO_USER_ID || 'demo-user';
    return this.profileService.update(userId, body);
  }
}
