import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostDocument = Post & Document;

export type CommentItem = {
  userId: string;
  displayName: string;
  content: string;
  createdAt: Date;
};

@Schema({ timestamps: true, collection: 'community_posts' })
export class Post {
  @Prop({ required: true })
  userId: string;

  @Prop({ default: '' })
  displayName: string;

  @Prop({ required: true })
  content: string;

  /** Mảng userId đã like */
  @Prop({ type: [String], default: [] })
  likes: string[];

  /** Bình luận nhúng trực tiếp */
  @Prop({
    type: [
      {
        userId: String,
        displayName: String,
        content: String,
        createdAt: { type: Date, default: () => new Date() },
      },
    ],
    default: [],
  })
  comments: CommentItem[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
