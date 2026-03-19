import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Req,
  Res,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';

/** Shape của req.user sau khi Google Strategy validate thành công */
type OAuthResult = { token: string; userId: string };

/**
 * AuthController – xử lý tất cả luồng xác thực:
 *  • Phone/password  : POST /api/auth/register, /login, /login-admin
 *  • Google OAuth    : GET  /api/auth/google, /google/callback
 *  • Thông tin user  : GET  /api/auth/me (JWT protected)
 */
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Phone / Password ────────────────────────────────────────────────────────

  /**
   * POST /api/auth/register
   * Body: { phone: string, password: string }
   * Trả về: { token: JWT, userId: string }
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

  // ─── Google OAuth ────────────────────────────────────────────────────────────

  /**
   * GET /api/auth/google
   * Passport tự redirect sang Google consent screen.
   * Không cần viết body – @UseGuards(AuthGuard('google')) làm toàn bộ.
   */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin(): void {
    // Passport tự xử lý redirect – handler này không bao giờ được gọi
  }

  /**
   * GET /api/auth/google/callback
   * Google redirect về đây sau khi user đồng ý.
   * req.user = { token, userId } từ GoogleStrategy.validate()
   *
   * Redirect về FE với token trong query string:
   *   ${FRONTEND_URL}/auth/callback?token=JWT&userId=ID
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleCallback(@Req() req: Request, @Res() res: Response): void {
    const { token, userId } = req.user as OAuthResult;
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&userId=${encodeURIComponent(userId)}`);
  }

  // ─── User info & Account setup ──────────────────────────────────────────────

  /**
   * GET /api/auth/me
   * Trả về thông tin user hiện tại từ JWT.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: Request): { userId: string } {
    return req.user as { userId: string };
  }

  /**
   * GET /api/auth/user-info
   * Trả về thông tin đầy đủ của user: phone, email, name, avatar, isGoogleUser, hasPhone, hasPassword.
   * FE dùng sau khi login để quyết định có cần hiện trang "Setup tài khoản" không.
   */
  @Get('user-info')
  @UseGuards(JwtAuthGuard)
  async getUserInfo(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.authService.getUserInfo(userId);
  }

  /**
   * PATCH /api/auth/setup-account
   * Body: { phone: string, password: string }
   * Cho phép Google user thêm số điện thoại + mật khẩu vào tài khoản.
   * Sau đó user có thể đăng nhập bằng cả Google lẫn phone/password.
   */
  @Patch('setup-account')
  @UseGuards(JwtAuthGuard)
  async setupAccount(
    @Req() req: Request,
    @Body('phone') phone: string,
    @Body('password') password: string,
  ) {
    if (!phone || !password) {
      throw new BadRequestException('Vui lòng nhập số điện thoại và mật khẩu.');
    }
    const { userId } = req.user as { userId: string };
    return this.authService.setupAccount(userId, phone, password);
  }
}
