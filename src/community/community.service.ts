import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './post.schema';
import { FriendRequest, FriendRequestDocument } from './friend-request.schema';
import { Message, MessageDocument } from './message.schema';
import { User, UserDocument } from '../user/user.schema';
import { Profile, ProfileDocument } from '../profile/profile.schema';

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(FriendRequest.name)
    private friendRequestModel: Model<FriendRequestDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
  ) {}

  // ─── Posts ──────────────────────────────────────────────────────────────────

  async createPost(userId: string, content: string, displayName: string) {
    return this.postModel.create({ userId, content, displayName });
  }

  async getPosts(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.postModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async toggleLike(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Bài viết không tồn tại.');
    const idx = post.likes.indexOf(userId);
    if (idx === -1) post.likes.push(userId);
    else post.likes.splice(idx, 1);
    await post.save();
    return { likes: post.likes.length, liked: idx === -1 };
  }

  async addComment(
    postId: string,
    userId: string,
    content: string,
    displayName: string,
  ) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Bài viết không tồn tại.');
    const comment = { userId, displayName, content, createdAt: new Date() };
    post.comments.push(comment as never);
    await post.save();
    return comment;
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Bài viết không tồn tại.');
    if (post.userId !== userId) throw new ForbiddenException('Không có quyền xóa.');
    await this.postModel.deleteOne({ _id: postId });
    return { success: true };
  }

  // ─── Users ──────────────────────────────────────────────────────────────────

  async getUsers(currentUserId: string) {
    const users = await this.userModel
      .find({ phone: { $ne: currentUserId } })
      .select({ phone: 1, _id: 0 })
      .lean();
    const userIds = users.map((u) => String((u as { phone?: string }).phone ?? ''));
    const profiles = await this.profileModel
      .find({ userId: { $in: userIds } })
      .select({ userId: 1, name: 1, class: 1, major: 1, _id: 0 })
      .lean();
    const profileMap = new Map(profiles.map((p) => [p.userId, p]));
    return userIds
      .filter(Boolean)
      .map((uid) => ({
        userId: uid,
        displayName: profileMap.get(uid)?.name || `Người dùng ${uid.slice(-4)}`,
        class: profileMap.get(uid)?.class || '',
        major: profileMap.get(uid)?.major || '',
      }));
  }

  // ─── Friends ────────────────────────────────────────────────────────────────

  async sendFriendRequest(fromUserId: string, toUserId: string) {
    if (fromUserId === toUserId)
      throw new BadRequestException('Không thể kết bạn với chính mình.');

    const existing = await this.friendRequestModel.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });
    if (existing) {
      if (existing.status === 'accepted')
        throw new ConflictException('Đã là bạn bè.');
      if (existing.status === 'pending')
        throw new ConflictException('Lời mời đã được gửi rồi.');
      // rejected → cho phép gửi lại
      await this.friendRequestModel.deleteOne({ _id: existing._id });
    }
    return this.friendRequestModel.create({ fromUserId, toUserId });
  }

  /** Lấy lời mời đang chờ (nhận được + đã gửi) */
  async getFriendRequests(userId: string) {
    const received = await this.friendRequestModel
      .find({ toUserId: userId, status: 'pending' })
      .lean();
    const sent = await this.friendRequestModel
      .find({ fromUserId: userId, status: 'pending' })
      .lean();
    return { received, sent };
  }

  async respondFriendRequest(
    requestId: string,
    userId: string,
    action: 'accept' | 'reject',
  ) {
    const req = await this.friendRequestModel.findById(requestId);
    if (!req) throw new NotFoundException('Lời mời không tồn tại.');
    if (req.toUserId !== userId)
      throw new ForbiddenException('Không có quyền thao tác.');
    req.status = action === 'accept' ? 'accepted' : 'rejected';
    await req.save();
    return { status: req.status };
  }

  async getFriends(userId: string) {
    const requests = await this.friendRequestModel
      .find({
        $or: [{ fromUserId: userId }, { toUserId: userId }],
        status: 'accepted',
      })
      .lean();
    const friendIds = requests.map((r) =>
      r.fromUserId === userId ? r.toUserId : r.fromUserId,
    );
    const profiles = await this.profileModel
      .find({ userId: { $in: friendIds } })
      .select({ userId: 1, name: 1, _id: 0 })
      .lean();
    const profileMap = new Map(profiles.map((p) => [p.userId, p]));
    return friendIds.map((fid) => ({
      userId: fid,
      displayName: profileMap.get(fid)?.name || `Người dùng ${fid.slice(-4)}`,
    }));
  }

  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    const req = await this.friendRequestModel.findOne({
      $or: [
        { fromUserId: userId1, toUserId: userId2, status: 'accepted' },
        { fromUserId: userId2, toUserId: userId1, status: 'accepted' },
      ],
    });
    return !!req;
  }

  // ─── Messages ───────────────────────────────────────────────────────────────

  /** Lấy tin nhắn giữa 2 người (chỉ bạn bè).
   *  `after` là ISO timestamp – chỉ trả tin nhắn mới hơn (dùng cho long-poll). */
  async getMessages(userId: string, friendId: string, after?: string) {
    if (!(await this.areFriends(userId, friendId)))
      throw new ForbiddenException('Chỉ bạn bè mới có thể nhắn tin.');
    const query: Record<string, unknown> = {
      $or: [
        { fromUserId: userId, toUserId: friendId },
        { fromUserId: friendId, toUserId: userId },
      ],
    };
    if (after) query.createdAt = { $gt: new Date(after) };
    return this.messageModel
      .find(query)
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();
  }

  async sendMessage(fromUserId: string, toUserId: string, content: string) {
    if (!(await this.areFriends(fromUserId, toUserId)))
      throw new ForbiddenException('Chỉ bạn bè mới có thể nhắn tin.');
    return this.messageModel.create({ fromUserId, toUserId, content });
  }
}
