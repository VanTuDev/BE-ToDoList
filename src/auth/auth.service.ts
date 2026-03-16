import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { hash, compare } from 'bcryptjs';
import { User, UserDocument } from '../user/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  /** Đăng ký: SĐT + mật khẩu. Mỗi SĐT chỉ đăng ký một lần. */
  async register(phone: string, password: string) {
    const normalized = this.normalizePhone(phone);
    const existing = await this.userModel.findOne({ phone: normalized }).lean();
    if (existing) {
      throw new ConflictException('Số điện thoại đã được đăng ký');
    }
    const passwordHash = await hash(password, 10);
    await this.userModel.create({ phone: normalized, passwordHash });
    return this.login(normalized, password);
  }

  /** Đăng nhập: trả về token và userId (chính là phone). */
  async login(phone: string, password: string) {
    const normalized = this.normalizePhone(phone);
    const user = await this.userModel.findOne({ phone: normalized }).lean();
    if (!user) {
      throw new UnauthorizedException('Số điện thoại hoặc mật khẩu không đúng');
    }
    const ok = await compare(password, String((user as { passwordHash?: string }).passwordHash ?? ''));
    if (!ok) {
      throw new UnauthorizedException('Số điện thoại hoặc mật khẩu không đúng');
    }
    const userId = normalized;
    const token = this.jwtService.sign({ sub: userId });
    return { token, userId };
  }

  private normalizePhone(phone: string): string {
    return String(phone).replace(/\D/g, '').trim() || phone;
  }
}
