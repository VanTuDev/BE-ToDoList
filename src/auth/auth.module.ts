import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { User, UserSchema } from '../user/user.schema';

/**
 * QUAN TRỌNG: Dùng registerAsync thay vì register để đọc JWT_SECRET
 * SAU KHI ConfigModule đã load file .env vào process.env.
 *
 * Nếu dùng register({ secret: process.env.JWT_SECRET }), giá trị được đọc
 * ngay lúc module file được import (trước khi ConfigModule khởi động),
 * lúc đó process.env.JWT_SECRET chưa có → dùng fallback → mismatch với
 * JwtStrategy (đọc sau khi ConfigModule đã load) → 401 mọi request.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'unitracker-secret-key',
        signOptions: { expiresIn: '30d' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
