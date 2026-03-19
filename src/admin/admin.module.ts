import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/user.schema';
import { DataModule } from '../data/data.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

/**
 * AdminModule – module quản trị, KHÔNG yêu cầu xác thực.
 *
 * Imports:
 *  - MongooseModule.forFeature([User]): để AdminService inject User model
 *  - DataModule: cung cấp DataService (đã export) để lấy full AppState
 *
 * Không cần AuthModule vì AdminController không dùng JwtAuthGuard nữa.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    DataModule,  // DataService dùng để lấy full AppState theo userId
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
