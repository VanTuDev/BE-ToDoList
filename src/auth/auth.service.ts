import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
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

  /**
   * Đăng ký tài khoản mới.
   *
   * Cơ chế định danh:
   *  - userId = phone đã chuẩn hóa (chỉ giữ chữ số).
   *  - MongoDB có unique index trên phone → đảm bảo không trùng lặp.
   *  - Mọi dữ liệu (TKB, task, môn học...) đều lưu kèm userId này,
   *    hoàn toàn tách biệt giữa các tài khoản.
   *  - Sau khi đăng ký thành công sẽ tự đăng nhập và trả token luôn.
   *
   * Ném:
   *  - 400 BadRequest   nếu input không hợp lệ.
   *  - 409 Conflict     nếu SĐT đã được đăng ký.
   */
  async register(phone: string, password: string) {
    const normalized = this.normalizePhone(phone);

    if (!normalized || normalized.length < 9) {
      throw new BadRequestException('Số điện thoại không hợp lệ.');
    }
    if (!password || String(password).length < 6) {
      throw new BadRequestException('Mật khẩu phải có ít nhất 6 ký tự.');
    }

    const existing = await this.userModel.findOne({ phone: normalized }).lean();
    if (existing) {
      throw new ConflictException(
        `Số điện thoại ${normalized} đã được đăng ký. Vui lòng đăng nhập.`,
      );
    }

    const passwordHash = await hash(password, 10);
    await this.userModel.create({ phone: normalized, passwordHash });

    // Tự đăng nhập sau khi tạo xong → trả token ngay
    return this._buildToken(normalized);
  }

  /**
   * Đăng nhập.
   * Trả về { token: JWT, userId } để FE lưu vào localStorage.
   * Token chứa sub = userId (phone chuẩn hóa) dùng làm khóa cho mọi dữ liệu.
   *
   * Ném:
   *  - 401 Unauthorized nếu sai SĐT hoặc mật khẩu.
   */
  async login(phone: string, password: string) {
    const normalized = this.normalizePhone(phone);
    const user = await this.userModel.findOne({ phone: normalized }).lean() as
      | { passwordHash?: string }
      | null;

    if (!user) {
      throw new UnauthorizedException('Số điện thoại hoặc mật khẩu không đúng.');
    }

    const ok = await compare(String(password), String(user.passwordHash ?? ''));
    if (!ok) {
      throw new UnauthorizedException('Số điện thoại hoặc mật khẩu không đúng.');
    }

    return this._buildToken(normalized);
  }

  /**
   * Đăng nhập admin bằng code + password (lấy từ biến môi trường ADMIN_CODE / ADMIN_PASSWORD).
   * JWT admin có thêm trường role: 'admin'.
   */
  async loginAdmin(code: string, password: string) {
    const adminCode = process.env.ADMIN_CODE || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin';
    if (code !== adminCode || password !== adminPass) {
      throw new ForbiddenException('Sai mã hoặc mật khẩu admin.');
    }
    const token = this.jwtService.sign({ sub: 'admin', role: 'admin' });
    return { token, userId: 'admin', isAdmin: true };
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  /** Chuẩn hóa phone: chỉ giữ lại chữ số. */
  private normalizePhone(phone: string): string {
    return String(phone).replace(/\D/g, '').trim();
  }

  /** Tạo JWT và trả về response chuẩn. */
  private _buildToken(userId: string) {
    const token = this.jwtService.sign({ sub: userId });
    return { token, userId };
  }
}
