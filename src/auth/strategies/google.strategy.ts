import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

/**
 * GoogleStrategy – xác thực OAuth 2.0 qua Google.
 *
 * Flow:
 *  1. GET /api/auth/google → Passport redirect sang Google consent screen
 *  2. Google redirect về callbackURL với code
 *  3. Passport đổi code lấy tokens, gọi Google People API
 *  4. `validate()` nhận profile → gọi AuthService.findOrCreateGoogleUser()
 *  5. req.user = { token, userId } được gắn vào request
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, emails, displayName, photos } = profile;
    const email = emails?.[0]?.value ?? '';
    const avatar = photos?.[0]?.value ?? '';

    try {
      const result = await this.authService.findOrCreateGoogleUser({
        googleId: id,
        email,
        name: displayName,
        avatar,
      });
      done(null, result);
    } catch (err) {
      done(err as Error, undefined);
    }
  }
}
