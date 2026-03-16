import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudyScheduleDocument = StudySchedule & Document;

@Schema({ collection: 'study_schedules' })
export class StudySchedule {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  subjectId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: false })
  completed: boolean;
}

export const StudyScheduleSchema = SchemaFactory.createForClass(StudySchedule);
