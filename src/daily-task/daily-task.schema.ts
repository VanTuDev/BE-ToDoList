import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DailyTaskDocument = DailyTask & Document;

@Schema({ collection: 'daily_tasks' })
export class DailyTask {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ default: false })
  completed: boolean;

  @Prop({ enum: ['high', 'medium', 'low'], default: 'medium' })
  priority: string;

  @Prop({ default: () => new Date().toISOString() })
  createdAt: string;
}

export const DailyTaskSchema = SchemaFactory.createForClass(DailyTask);
