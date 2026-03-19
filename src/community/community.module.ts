import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './post.schema';
import { FriendRequest, FriendRequestSchema } from './friend-request.schema';
import { Message, MessageSchema } from './message.schema';
import { User, UserSchema } from '../user/user.schema';
import { Profile, ProfileSchema } from '../profile/profile.schema';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';

/**
 * CommunityModule – tính năng cộng đồng: bài viết, bạn bè, tin nhắn.
 *
 * Import cả User + Profile để lấy thông tin hiển thị người dùng.
 * JwtAuthGuard dùng JwtStrategy đã đăng ký bởi AuthModule → không cần import lại.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: FriendRequest.name, schema: FriendRequestSchema },
      { name: Message.name, schema: MessageSchema },
      { name: User.name, schema: UserSchema },
      { name: Profile.name, schema: ProfileSchema },
    ]),
  ],
  controllers: [CommunityController],
  providers: [CommunityService],
})
export class CommunityModule {}
