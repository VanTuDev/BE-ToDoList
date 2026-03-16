import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Đăng ký: body { phone, password } */
  @Post('register')
  async register(
    @Body('phone') phone: string,
    @Body('password') password: string,
  ) {
    if (!phone || !password) {
      throw new BadRequestException('Cần nhập số điện thoại và mật khẩu');
    }
    return this.authService.register(phone, password);
  }

  /** Đăng nhập: body { phone, password } -> { token, userId } */
  @Post('login')
  async login(
    @Body('phone') phone: string,
    @Body('password') password: string,
  ) {
    if (!phone || !password) {
      throw new BadRequestException('Cần nhập số điện thoại và mật khẩu');
    }
    return this.authService.login(phone, password);
  }
}
