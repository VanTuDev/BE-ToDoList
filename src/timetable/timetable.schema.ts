import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TimetableSlotDocument = TimetableSlot & Document;

@Schema({ collection: 'timetable_slots' })
export class TimetableSlot {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  subjectId: string;

  @Prop({ required: true, min: 0, max: 6 })
  day: number;

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;

  @Prop({ required: true })
  room: string;

  @Prop({ enum: ['lecture', 'lab', 'tutorial'], default: 'lecture' })
  type: string;
}

export const TimetableSlotSchema = SchemaFactory.createForClass(TimetableSlot);
