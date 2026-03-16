import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StudySchedule, StudyScheduleDocument } from './study-schedule.schema';

@Injectable()
export class StudyScheduleService {
  constructor(
    @InjectModel(StudySchedule.name)
    private scheduleModel: Model<StudyScheduleDocument>,
  ) {}

  async findAll(userId: string) {
    const list = await this.scheduleModel
      .find({ userId })
      .sort({ date: 1, startTime: 1 })
      .lean();
    return list.map((d) => this.toResponse(d as Record<string, unknown>));
  }

  async create(userId: string, body: Record<string, unknown>) {
    const doc = await this.scheduleModel.create({
      userId,
      subjectId: body.subjectId,
      title: body.title ?? '',
      date: body.date ?? '',
      startTime: body.startTime ?? '19:00',
      endTime: body.endTime ?? '21:00',
      description: body.description ?? '',
      completed: false,
    });
    return this.toResponse(doc.toObject() as unknown as Record<string, unknown>);
  }

  async toggle(id: string, userId: string) {
    const doc = await this.scheduleModel.findOne({ _id: id, userId }).lean();
    if (!doc) return null;
    const next = await this.scheduleModel
      .findOneAndUpdate(
        { _id: id, userId },
        { $set: { completed: !(doc as Record<string, unknown>).completed } },
        { new: true },
      )
      .lean();
    return this.toResponse(next as Record<string, unknown>);
  }

  async remove(id: string, userId: string) {
    const doc = await this.scheduleModel.findOneAndDelete({ _id: id, userId });
    return !!doc;
  }

  private toResponse(d: Record<string, unknown>) {
    return {
      id: String(d._id),
      subjectId: d.subjectId ?? '',
      title: d.title ?? '',
      date: d.date ?? '',
      startTime: d.startTime ?? '',
      endTime: d.endTime ?? '',
      description: d.description ?? '',
      completed: d.completed ?? false,
    };
  }
}
