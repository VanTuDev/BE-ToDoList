import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailyTask, DailyTaskDocument } from './daily-task.schema';

@Injectable()
export class DailyTaskService {
  constructor(
    @InjectModel(DailyTask.name) private taskModel: Model<DailyTaskDocument>,
  ) {}

  async findAll(userId: string) {
    const list = await this.taskModel.find({ userId }).sort({ createdAt: -1 }).lean();
    return list.map((d) => this.toResponse(d as Record<string, unknown>));
  }

  async create(userId: string, body: Record<string, unknown>) {
    const doc = await this.taskModel.create({
      userId,
      title: body.title ?? '',
      completed: false,
      priority: body.priority ?? 'medium',
      createdAt: new Date().toISOString(),
    });
    return this.toResponse(doc.toObject() as unknown as Record<string, unknown>);
  }

  /** Thêm nhiều việc một lúc (bulk) */
  async createBulk(userId: string, items: Array<{ title: string; priority?: string }>) {
    const valid = items.filter((item) => String(item.title ?? '').trim().length > 0);
    if (valid.length === 0) return [];
    const now = new Date().toISOString();
    const docs = await this.taskModel.insertMany(
      valid.map((item) => ({
        userId,
        title: String(item.title ?? '').trim(),
        completed: false,
        priority: item.priority ?? 'medium',
        createdAt: now,
      })),
    );
    return docs.map((d) => this.toResponse(d.toObject() as unknown as Record<string, unknown>));
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

  async remove(id: string, userId: string) {
    const doc = await this.taskModel.findOneAndDelete({ _id: id, userId });
    return !!doc;
  }

  private toResponse(d: Record<string, unknown>) {
    return {
      id: String(d._id),
      title: d.title ?? '',
      completed: d.completed ?? false,
      priority: d.priority ?? 'medium',
      createdAt: d.createdAt ?? new Date().toISOString(),
    };
  }
}
