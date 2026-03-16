import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StudyTask, StudyTaskDocument } from './study-task.schema';

@Injectable()
export class StudyTaskService {
  constructor(
    @InjectModel(StudyTask.name) private taskModel: Model<StudyTaskDocument>,
  ) {}

  async findAll(userId: string) {
    const list = await this.taskModel.find({ userId }).sort({ date: 1 }).lean();
    return list.map((d) => this.toResponse(d as Record<string, unknown>));
  }

  async toggle(id: string, userId: string) {
    const doc = await this.taskModel.findOne({ _id: id, userId }).lean();
    if (!doc) return null;
    const next = await this.taskModel
      .findOneAndUpdate(
        { _id: id, userId },
        { $set: { completed: !(doc as Record<string, unknown>).completed } },
        { new: true },
      )
      .lean();
    return this.toResponse(next as Record<string, unknown>);
  }

  private toResponse(d: Record<string, unknown>) {
    return {
      id: String(d._id),
      subjectId: d.subjectId ?? '',
      title: d.title ?? '',
      date: d.date ?? '',
      completed: d.completed ?? false,
      priority: d.priority ?? 'medium',
      category: d.category ?? 'study',
      estimatedMinutes: d.estimatedMinutes ?? 60,
    };
  }
}
