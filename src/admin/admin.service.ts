import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { hash } from 'bcryptjs';
import { User, UserDocument } from '../user/user.schema';
import { DataService } from '../data/data.service';

/** Shape trả về cho admin (ẩn passwordHash) */
export type AdminUserDto = {
  userId: string;   // chính là phone
  phone: string;
};

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly dataService: DataService,
  ) {}

  // ─── Lấy danh sách tất cả user ────────────────────────────────────────────
  /**
   * GET /api/admin/users
   * Trả về mảng { userId, phone } cho tất cả user đã đăng ký.
   */
  async listUsers(): Promise<AdminUserDto[]> {
    const users = await this.userModel
      .find()
      .select({ phone: 1, _id: 0 })
      .lean();
    return users
      .map((u) => {
        const phone = String((u as { phone?: string }).phone ?? '');
        return { userId: phone, phone };
      })
      .filter((u) => u.phone);
  }

  // ─── Lấy thông tin 1 user theo userId (phone) ──────────────────────────────
  /**
   * GET /api/admin/users/:userId
   * Trả về { userId, phone } của user có phone = userId.
   * Ném 404 nếu không tìm thấy.
   */
  async getUser(userId: string): Promise<AdminUserDto> {
    const user = await this.userModel
      .findOne({ phone: userId })
      .select({ phone: 1, _id: 0 })
      .lean();
    if (!user) throw new NotFoundException(`Không tìm thấy user: ${userId}`);
    const phone = String((user as { phone?: string }).phone ?? '');
    return { userId: phone, phone };
  }

  // ─── Admin tạo user mới (bypass flow đăng ký thông thường) ────────────────
  /**
   * POST /api/admin/users
   * Body: { phone, password }
   * Tạo mới tài khoản; phone phải chưa tồn tại, password tối thiểu 1 ký tự.
   */
  async createUser(phone: string, password: string): Promise<AdminUserDto> {
    const normalized = this.normalizePhone(phone);
    const existing = await this.userModel.findOne({ phone: normalized }).lean();
    if (existing) {
      throw new ConflictException(`Số điện thoại đã tồn tại: ${normalized}`);
    }
    const passwordHash = await hash(password, 10);
    await this.userModel.create({ phone: normalized, passwordHash });
    return { userId: normalized, phone: normalized };
  }

  // ─── Admin đổi mật khẩu cho user ──────────────────────────────────────────
  /**
   * PATCH /api/admin/users/:userId
   * Body: { password }
   * Cập nhật mật khẩu mới (hash lại) cho user có phone = userId.
   * Ném 404 nếu user không tồn tại.
   */
  async updateUserPassword(
    userId: string,
    newPassword: string,
  ): Promise<AdminUserDto> {
    const passwordHash = await hash(newPassword, 10);
    const updated = await this.userModel
      .findOneAndUpdate(
        { phone: userId },
        { $set: { passwordHash } },
        { new: true },
      )
      .select({ phone: 1, _id: 0 })
      .lean();
    if (!updated) throw new NotFoundException(`Không tìm thấy user: ${userId}`);
    const phone = String((updated as { phone?: string }).phone ?? '');
    return { userId: phone, phone };
  }

  // ─── Admin xóa user khỏi DB ────────────────────────────────────────────────
  /**
   * DELETE /api/admin/users/:userId
   * Xóa user có phone = userId.
   * Dữ liệu liên quan (tasks, subjects...) vẫn còn trong collection riêng
   * nhưng user không login được nữa.
   * Ném 404 nếu không tìm thấy.
   */
  async deleteUser(userId: string): Promise<{ message: string }> {
    const result = await this.userModel.deleteOne({ phone: userId });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Không tìm thấy user: ${userId}`);
    }
    return { message: `Đã xóa user ${userId}` };
  }

  // ─── Lấy toàn bộ AppState của 1 user ──────────────────────────────────────
  /**
   * GET /api/admin/users/:userId/state
   * Trả về toàn bộ dữ liệu (profile, subjects, tasks...) của user theo phone.
   */
  async getUserState(userId: string) {
    return this.dataService.getFullState(userId);
  }

  // ─── Normalize phone (giữ chỉ số) ────────────────────────────────────────
  private normalizePhone(phone: string): string {
    return String(phone).replace(/\D/g, '').trim() || phone;
  }
}
