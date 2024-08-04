import * as bcrypt from 'bcrypt';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/sign-in.dto';
import { JwtRefreshTokenStrategy } from './strategy/jwt-refresh-token.strategy';
import { RefreshTokenIdsStorage } from './refresh-token-ids-storage';
import { TEXTS } from '../constants/texts';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(JwtRefreshTokenStrategy.name);

  constructor(
    private usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
  ) {}

  async validatePassword(
    userPassword: string,
    password: string,
  ): Promise<boolean> {
    if (userPassword && password) {
      return bcrypt.compare(userPassword, password);
    }
    return false;
  }

  async signIn(signInDto: SignInDto) {
    const { username, email, password } = signInDto;

    const user = await this.usersService.findByUsernameOrEmail(username, email);

    if (!user) {
      throw new UnauthorizedException(TEXTS.MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    const passwordIsValid = await this.validatePassword(
      password,
      user.password,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException(TEXTS.MESSAGES.AUTH.INVALID_PASSWORD);
    }

    const payload = { sub: user.id, username: user.username };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: process.env.REFRES_TOKEN_EXPIRATION,
    });

    await this.refreshTokenIdsStorage.insert(user.id, refreshToken);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    const { password: userPassword, ...result } = user;
    if (user && (await this.validatePassword(password, userPassword))) {
      return result;
    }
    return null;
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken);
      await this.refreshTokenIdsStorage.validate(decoded.sub, refreshToken);

      const payload = { sub: decoded.sub, username: decoded.username };
      const accessToken = await this.jwtService.signAsync(payload);
      const newRefreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: process.env.REFRES_TOKEN_EXPIRATION,
      });

      return { access_token: accessToken, refresh_token: newRefreshToken };
    } catch (error) {
      this.logger.error(
        `${TEXTS.MESSAGES.GENERIC.ERROR_MESSAGE_COMPOSE} ${error.message}`,
      );
      throw new UnauthorizedException(
        TEXTS.MESSAGES.AUTH.INVALID_REFRESH_TOKEN,
      );
    }
  }

  async invalidateToken(accessToken: string): Promise<void> {
    try {
      const decoded = await this.jwtService.verifyAsync(accessToken);
      await this.refreshTokenIdsStorage.invalidate(decoded.sub);
    } catch (error) {
      throw new UnauthorizedException(TEXTS.MESSAGES.AUTH.INVALID_ACCESS_TOKEN);
    }
  }
}
