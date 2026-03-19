import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FriendRequestDocument = FriendRequest & Document;

@Schema({ timestamps: true, collection: 'friend_requests' })
export class FriendRequest {
  @Prop({ required: true })
  fromUserId: string;

  @Prop({ required: true })
  toUserId: string;

  /** pending → accepted | rejected */
  @Prop({ enum: ['pending', 'accepted', 'rejected'], default: 'pending' })
  status: string;
}

export const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);
