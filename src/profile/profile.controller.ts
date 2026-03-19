import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../auth/current-user.decorator';

@Controller('api/profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@CurrentUserId() userId: string) {
    return this.profileService.getOrCreate(userId);
  }

  @Patch()
  async updateProfile(
    @CurrentUserId() userId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.profileService.update(userId, body);
  }
}
