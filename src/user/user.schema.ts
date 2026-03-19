import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

/**
 * User schema – hỗ trợ cả 2 luồng đăng nhập:
 *  1. Phone + password  → phone là userId
 *  2. Google OAuth      → googleId là userId
 *
 * Cả 2 field `phone` và `googleId` đều dùng sparse unique index
 * (sparse cho phép nhiều document có giá trị null cùng lúc mà không vi phạm unique).
 */
@Schema({ collection: 'users' })
export class User {
  // ── Phone login ─────────────────────────────────────────────────────────────
  // Không dùng default null để tránh unique index coi `null` là một giá trị.
  @Prop({ type: String, unique: true, sparse: true, default: undefined })
  phone?: string;

  @Prop({ default: '' })
  passwordHash: string;

  // ── Google OAuth ─────────────────────────────────────────────────────────────
  /** Google sub (unique per Google account) */
  @Prop({ type: String, unique: true, sparse: true, default: undefined })
  googleId?: string;

  /** Email từ Google profile */
  @Prop({ default: '' })
  email: string;

  /** Tên hiển thị từ Google profile */
  @Prop({ default: '' })
  name: string;

  /** Avatar URL từ Google profile */
  @Prop({ default: '' })
  avatar: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
