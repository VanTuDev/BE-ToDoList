import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/register
   * Body: { phone: string, password: string }
   * Trả về: { token: JWT, userId: string }
   *
   * Quy tắc:
   *  - phone phải có 9–11 chữ số.
   *  - password tối thiểu 6 ký tự.
   *  - Mỗi SĐT chỉ đăng ký được 1 lần (unique).
   *  - 409 Conflict nếu SĐT đã tồn tại.
   */
  @Post('register')
  async register(
    @Body('phone') phone: string,
    @Body('password') password: string,
  ) {
    if (!phone || !String(phone).trim()) {
      throw new BadRequestException('Vui lòng nhập số điện thoại.');
    }

    const digits = String(phone).replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 11) {
      throw new BadRequestException('Số điện thoại không hợp lệ (9–11 chữ số).');
    }

    if (!password || String(password).length < 6) {
      throw new BadRequestException('Mật khẩu phải có ít nhất 6 ký tự.');
    }

    return this.authService.register(phone, password);
  }

  /**
   * POST /api/auth/login
   * Body: { phone: string, password: string }
   * Trả về: { token: JWT, userId: string }
   *
   * Token JWT chứa sub = userId (phone đã chuẩn hóa).
   * FE lưu token vào localStorage và gắn vào header Authorization: Bearer <token>.
   * Mỗi API lấy dữ liệu (TKB, task...) sẽ extract userId từ token để lấy đúng data của user đó.
   */
  @Post('login')
  async login(
    @Body('phone') phone: string,
    @Body('password') password: string,
  ) {
    if (!phone || !password) {
      throw new BadRequestException('Cần nhập số điện thoại và mật khẩu.');
    }
    return this.authService.login(phone, password);
  }

  /**
   * POST /api/auth/login-admin
   * Body: { code: string, password: string }
   * Trả về: { token: JWT, userId: 'admin', isAdmin: true }
   */
  @Post('login-admin')
  async loginAdmin(
    @Body('code') code: string,
    @Body('password') password: string,
  ) {
    if (!code || !password) {
      throw new BadRequestException('Cần nhập mã admin và mật khẩu.');
    }
    return this.authService.loginAdmin(code, password);
  }
}
