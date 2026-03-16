import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProfileDocument = Profile & Document;

@Schema({ collection: 'profiles' })
export class Profile {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ default: '' })
  name: string;

  @Prop({ default: '' })
  class: string;

  @Prop({ default: 0 })
  age: number;

  @Prop({ default: '' })
  studentId: string;

  @Prop({ default: '' })
  email: string;

  @Prop({ default: '' })
  major: string;

  @Prop({ default: 'Spring 2026' })
  semester: string;

  @Prop({ default: 'FPT University HCM' })
  campus: string;

  @Prop({ default: 0 })
  gpa: number;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
