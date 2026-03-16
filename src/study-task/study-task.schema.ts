import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudyTaskDocument = StudyTask & Document;

@Schema({ collection: 'study_tasks' })
export class StudyTask {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  subjectId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  date: string;

  @Prop({ default: false })
  completed: boolean;

  @Prop({ enum: ['high', 'medium', 'low'], default: 'medium' })
  priority: string;

  @Prop({ enum: ['assignment', 'study', 'exam-prep', 'lab', 'project'], default: 'study' })
  category: string;

  @Prop({ default: 60 })
  estimatedMinutes: number;
}

export const StudyTaskSchema = SchemaFactory.createForClass(StudyTask);
