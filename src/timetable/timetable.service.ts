import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TimetableSlot, TimetableSlotDocument } from './timetable.schema';

@Injectable()
export class TimetableService {
  constructor(
    @InjectModel(TimetableSlot.name)
    private slotModel: Model<TimetableSlotDocument>,
  ) {}

  async findAll(userId: string) {
    const list = await this.slotModel.find({ userId }).sort({ day: 1, startTime: 1 }).lean();
    return list.map((d) => this.toResponse(d as Record<string, unknown>));
  }

  async create(userId: string, body: Record<string, unknown>) {
    const doc = await this.slotModel.create({
      userId,
      subjectId: body.subjectId,
      day: body.day ?? 0,
      startTime: body.startTime ?? '07:30',
      endTime: body.endTime ?? '09:30',
      room: body.room ?? '',
      type: body.type ?? 'lecture',
    });
    return this.toResponse(doc.toObject() as unknown as Record<string, unknown>);
  }

  async remove(id: string, userId: string) {
    const doc = await this.slotModel.findOneAndDelete({ _id: id, userId });
    return !!doc;
  }

  private toResponse(d: Record<string, unknown>) {
    return {
      id: String(d._id),
      subjectId: d.subjectId ?? '',
      day: d.day ?? 0,
      startTime: d.startTime ?? '',
      endTime: d.endTime ?? '',
      room: d.room ?? '',
      type: d.type ?? 'lecture',
    };
  }
}
