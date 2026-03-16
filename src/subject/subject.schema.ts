import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubjectDocument = Subject & Document;

@Schema({ collection: 'subjects' })
export class Subject {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 3 })
  credits: number;

  @Prop({ default: '' })
  instructor: string;

  @Prop({ default: '' })
  room: string;

  @Prop({ default: '#f97316' })
  color: string;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
