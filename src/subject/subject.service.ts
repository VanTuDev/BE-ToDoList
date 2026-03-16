import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subject, SubjectDocument } from './subject.schema';
import { CreateSubjectDto, UpdateSubjectDto } from './subject.dto';

const COLORS = [
  '#f97316', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4',
  '#eab308', '#ef4444', '#3b82f6', '#84cc16', '#f472b6',
];

@Injectable()
export class SubjectService {
  constructor(
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
  ) {}

  async findAll(userId: string) {
    const list = await this.subjectModel.find({ userId }).lean();
    return list.map((d) => this.toResponse(d as Record<string, unknown>));
  }

  async create(userId: string, dto: CreateSubjectDto) {
    const count = await this.subjectModel.countDocuments({ userId });
    const doc = await this.subjectModel.create({
      userId,
      ...dto,
      code: dto.code?.toUpperCase() ?? dto.code,
      color: dto.color ?? COLORS[count % COLORS.length],
    });
    return this.toResponse(doc.toObject() as unknown as Record<string, unknown>);
  }

  async update(id: string, userId: string, dto: UpdateSubjectDto) {
    const doc = await this.subjectModel
      .findOneAndUpdate(
        { _id: id, userId },
        { ...dto, ...(dto.code && { code: dto.code.toUpperCase() }) },
        { new: true },
      )
      .lean();
    if (!doc) return null;
    return this.toResponse(doc as Record<string, unknown>);
  }

  async remove(id: string, userId: string) {
    const doc = await this.subjectModel.findOneAndDelete({ _id: id, userId });
    return !!doc;
  }

  private toResponse(d: Record<string, unknown>) {
    return {
      id: String(d._id),
      code: d.code ?? '',
      name: d.name ?? '',
      credits: d.credits ?? 3,
      instructor: d.instructor ?? '',
      room: d.room ?? '',
      color: d.color ?? '#f97316',
    };
  }
}
