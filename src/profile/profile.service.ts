import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile, ProfileDocument } from './profile.schema';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
  ) {}

  async getOrCreate(userId: string) {
    let doc: Record<string, unknown> | null = await this.profileModel.findOne({ userId }).lean() as Record<string, unknown> | null;
    if (!doc) {
      const created = await this.profileModel.create({
        userId,
        name: '',
        class: '',
        age: 0,
        studentId: '',
        email: '',
        major: '',
        semester: 'Spring 2026',
        campus: 'FPT University HCM',
        gpa: 0,
      });
      doc = created.toObject() as unknown as Record<string, unknown>;
    }
    return this.toResponse(doc);
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
      major: d.major ?? '',
      semester: d.semester ?? 'Spring 2026',
      campus: d.campus ?? 'FPT University HCM',
      gpa: d.gpa ?? 0,
    };
  }
}
