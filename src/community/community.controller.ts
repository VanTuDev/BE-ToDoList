import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../auth/current-user.decorator';

/**
 * CommunityController – tất cả route đều yêu cầu JWT.
 *
 * Posts:
 *   GET  /api/community/posts              - lấy bảng tin (page, limit)
 *   POST /api/community/posts              - đăng bài
 *   POST /api/community/posts/:id/like     - toggle like
 *   POST /api/community/posts/:id/comments - bình luận
 *   DELETE /api/community/posts/:id        - xóa bài (chỉ tác giả)
 *
 * Users:
 *   GET  /api/community/users              - danh sách tất cả user (ngoại trừ bản thân)
 *
 * Friends:
 *   POST  /api/community/friends/request       - gửi lời mời kết bạn
 *   GET   /api/community/friends/requests      - lời mời đang chờ
 *   PATCH /api/community/friends/requests/:id  - accept / reject
 *   GET   /api/community/friends               - danh sách bạn bè
 *
 * Messages (long-poll 30s từ FE):
 *   GET  /api/community/messages/:friendId          - lấy tin nhắn
 *   GET  /api/community/messages/:friendId?after=.. - chỉ lấy tin nhắn mới hơn after
 *   POST /api/community/messages/:friendId          - gửi tin nhắn
 */
@Controller('api/community')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  // ─── Posts ──────────────────────────────────────────────────────────────────

  @Get('posts')
  getPosts(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.communityService.getPosts(Number(page) || 1, Number(limit) || 20);
  }

  @Post('posts')
  createPost(
    @CurrentUserId() userId: string,
    @Body('content') content: string,
    @Body('displayName') displayName: string,
  ) {
    if (!content?.trim()) throw new BadRequestException('Nội dung không được để trống.');
    return this.communityService.createPost(userId, content.trim(), displayName || userId);
  }

  @Post('posts/:id/like')
  toggleLike(
    @Param('id') id: string,
    @CurrentUserId() userId: string,
  ) {
    return this.communityService.toggleLike(id, userId);
  }

  @Post('posts/:id/comments')
  addComment(
    @Param('id') id: string,
    @CurrentUserId() userId: string,
    @Body('content') content: string,
    @Body('displayName') displayName: string,
  ) {
    if (!content?.trim()) throw new BadRequestException('Bình luận không được để trống.');
    return this.communityService.addComment(id, userId, content.trim(), displayName || userId);
  }

  @Delete('posts/:id')
  deletePost(
    @Param('id') id: string,
    @CurrentUserId() userId: string,
  ) {
    return this.communityService.deletePost(id, userId);
  }

  // ─── Users ──────────────────────────────────────────────────────────────────

  @Get('users')
  getUsers(@CurrentUserId() userId: string) {
    return this.communityService.getUsers(userId);
  }

  // ─── Friends ────────────────────────────────────────────────────────────────

  @Post('friends/request')
  sendFriendRequest(
    @CurrentUserId() userId: string,
    @Body('toUserId') toUserId: string,
  ) {
    if (!toUserId?.trim()) throw new BadRequestException('Thiếu toUserId.');
    return this.communityService.sendFriendRequest(userId, toUserId.trim());
  }

  @Get('friends/requests')
  getFriendRequests(@CurrentUserId() userId: string) {
    return this.communityService.getFriendRequests(userId);
  }

  @Patch('friends/requests/:id')
  respondFriendRequest(
    @Param('id') id: string,
    @CurrentUserId() userId: string,
    @Body('action') action: 'accept' | 'reject',
  ) {
    if (!['accept', 'reject'].includes(action))
      throw new BadRequestException('action phải là "accept" hoặc "reject".');
    return this.communityService.respondFriendRequest(id, userId, action);
  }

  @Get('friends')
  getFriends(@CurrentUserId() userId: string) {
    return this.communityService.getFriends(userId);
  }

  // ─── Messages ───────────────────────────────────────────────────────────────

  @Get('messages/:friendId')
  getMessages(
    @Param('friendId') friendId: string,
    @CurrentUserId() userId: string,
    @Query('after') after?: string,
  ) {
    return this.communityService.getMessages(userId, friendId, after);
  }

  @Post('messages/:friendId')
  sendMessage(
    @Param('friendId') friendId: string,
    @CurrentUserId() userId: string,
    @Body('content') content: string,
  ) {
    if (!content?.trim()) throw new BadRequestException('Nội dung không được để trống.');
    return this.communityService.sendMessage(userId, friendId, content.trim());
  }
}
