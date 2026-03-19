import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile, ProfileDocument } from './profile.schema';
import { User, UserDocument } from '../user/user.schema';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Lấy profile theo userId. Nếu chưa có, tạo mới.
   * Với Google user: tự động điền name, email, avatar từ bảng users.
   */
  async getOrCreate(userId: string) {
    const existing = await this.profileModel.findOne({ userId }).lean() as Record<string, unknown> | null;
    if (existing) {
      // Nếu profile đã có nhưng name còn trống, thử sync từ Google user
      if (!existing.name) {
        const user = await this.userModel
          .findOne({ $or: [{ googleId: userId }, { phone: userId }] })
          .lean() as { name?: string; email?: string; avatar?: string } | null;
        if (user?.name) {
          const updated = await this.profileModel
            .findOneAndUpdate(
              { userId },
              { $set: { name: user.name, email: user.email || existing.email, avatar: user.avatar || existing.avatar } },
              { new: true },
            )
            .lean() as Record<string, unknown> | null;
          return this.toResponse(updated ?? existing);
        }
      }
      return this.toResponse(existing);
    }

    // Lấy thông tin Google (hoặc phone user) từ bảng users để pre-fill
    const user = await this.userModel
      .findOne({ $or: [{ googleId: userId }, { phone: userId }] })
      .lean() as { name?: string; email?: string; avatar?: string } | null;

    const created = await this.profileModel.create({
      userId,
      name: user?.name || '',
      class: '',
      age: 0,
      studentId: '',
      email: user?.email || '',
      avatar: user?.avatar || '',
      major: '',
      semester: 'Spring 2026',
      campus: 'FPT University HCM',
      gpa: 0,
    });
    return this.toResponse(created.toObject() as unknown as Record<string, unknown>);
  }

  async update(userId: string, data: Record<string, unknown>) {
    const doc = await this.profileModel
      .findOneAndUpdate(
        { userId },
        { $set: data },
        { new: true, upsert: true },
      )
      .lean() as Record<string, unknown> | null;
    if (!doc) throw new Error('Profile update failed');
    return this.toResponse(doc);
  }

  private toResponse(doc: ProfileDocument | Record<string, unknown>) {
    const d = doc as Record<string, unknown>;
    return {
      id: d.userId || 'user-001',
      name: d.name ?? '',
      class: d.class ?? '',
      age: d.age ?? 0,
      studentId: d.studentId ?? '',
      email: d.email ?? '',
      avatar: d.avatar ?? '',
      major: d.major ?? '',
      semester: d.semester ?? 'Spring 2026',
      campus: d.campus ?? 'FPT University HCM',
      gpa: d.gpa ?? 0,
    };
  }
}
