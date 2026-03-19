import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { AdminService } from './admin.service';

/**
 * AdminController – KHÔNG yêu cầu xác thực.
 * Bất kỳ ai cũng có thể xem danh sách và dữ liệu người dùng.
 *
 * Base URL: /api/admin
 */
@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── GET /api/admin/users ──────────────────────────────────────────────────
  /**
   * Lấy danh sách tất cả người dùng.
   * Response: [{ userId, phone }]
   *
   * Postman:
   *   GET http://localhost:4000/api/admin/users
   */
  @Get('users')
  async listUsers() {
    return this.adminService.listUsers();
  }

  // ─── GET /api/admin/users/:userId ─────────────────────────────────────────
  /**
   * Lấy thông tin 1 user theo userId (phone).
   * Response: { userId, phone }
   *
   * Postman:
   *   GET http://localhost:4000/api/admin/users/0901234567
   */
  @Get('users/:userId')
  async getUser(@Param('userId') userId: string) {
    return this.adminService.getUser(userId);
  }

  // ─── POST /api/admin/users ─────────────────────────────────────────────────
  /**
   * Tạo user mới.
   * Body: { "phone": "0901234567", "password": "abc123" }
   * Response: { userId, phone }
   *
   * Postman:
   *   POST http://localhost:4000/api/admin/users
   *   Content-Type: application/json
   *   Body (raw JSON): { "phone": "0901234567", "password": "abc123" }
   */
  @Post('users')
  async createUser(
    @Body('phone') phone: string,
    @Body('password') password: string,
  ) {
    if (!phone || !password) {
      throw new BadRequestException('Cần nhập phone và password');
    }
    return this.adminService.createUser(phone, password);
  }

  // ─── PATCH /api/admin/users/:userId ───────────────────────────────────────
  /**
   * Đổi mật khẩu user.
   * Body: { "password": "newpass123" }
   * Response: { userId, phone }
   *
   * Postman:
   *   PATCH http://localhost:4000/api/admin/users/0901234567
   *   Content-Type: application/json
   *   Body (raw JSON): { "password": "newpass123" }
   */
  @Patch('users/:userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body('password') password: string,
  ) {
    if (!password) {
      throw new BadRequestException('Cần nhập password mới');
    }
    return this.adminService.updateUserPassword(userId, password);
  }

  // ─── DELETE /api/admin/users/:userId ──────────────────────────────────────
  /**
   * Xóa user.
   * Response: { message: "Đã xóa user <phone>" }
   *
   * Postman:
   *   DELETE http://localhost:4000/api/admin/users/0901234567
   */
  @Delete('users/:userId')
  async deleteUser(@Param('userId') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  // ─── GET /api/admin/users/:userId/state ───────────────────────────────────
  /**
   * Lấy toàn bộ AppState (profile, subjects, tasks...) của user.
   * Response: AppState object
   *
   * Postman:
   *   GET http://localhost:4000/api/admin/users/0901234567/state
   */
  @Get('users/:userId/state')
  async getUserState(@Param('userId') userId: string) {
    return this.adminService.getUserState(userId);
  }
}
