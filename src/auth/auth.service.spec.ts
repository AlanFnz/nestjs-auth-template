import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenIdsStorage } from './refresh-token-ids-storage';
import { UnauthorizedException } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let refreshTokenIdsStorage: RefreshTokenIdsStorage;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByUsernameOrEmail: jest.fn(),
            findByUsername: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: RefreshTokenIdsStorage,
          useValue: {
            insert: jest.fn(),
            validate: jest.fn(),
            invalidate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    refreshTokenIdsStorage = module.get<RefreshTokenIdsStorage>(
      RefreshTokenIdsStorage,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should return access and refresh tokens for valid credentials', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        email: 'test@test.com',
      };
      const mockSignInDto: SignInDto = {
        username: 'testuser',
        email: '',
        password: 'testpassword',
      };

      jest.spyOn(service, 'validatePassword').mockResolvedValueOnce(true);
      jest
        .spyOn(usersService, 'findByUsernameOrEmail')
        .mockResolvedValueOnce(mockUser);
      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce('accessToken')
        .mockResolvedValueOnce('refreshToken');

      const result = await service.signIn(mockSignInDto);

      expect(result).toEqual({
        access_token: 'accessToken',
        refresh_token: 'refreshToken',
      });
      expect(usersService.findByUsernameOrEmail).toHaveBeenCalledWith(
        mockSignInDto.username,
        '',
      );
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('should throw an UnauthorizedException if the user is not found', async () => {
      const mockSignInDto: SignInDto = {
        username: 'testuser',
        email: '',
        password: 'testpassword',
      };

      jest
        .spyOn(usersService, 'findByUsernameOrEmail')
        .mockResolvedValueOnce(null);

      await expect(service.signIn(mockSignInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw an UnauthorizedException if the password is invalid', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        email: 'test@test.com',
      };
      const mockSignInDto: SignInDto = {
        username: 'testuser',
        email: '',
        password: 'testpassword',
      };

      jest
        .spyOn(usersService, 'findByUsernameOrEmail')
        .mockResolvedValueOnce(mockUser);
      jest.spyOn(service, 'validatePassword').mockResolvedValueOnce(false);

      await expect(service.signIn(mockSignInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('should return new access and refresh tokens for a valid refresh token', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@test.com' };
      const mockRefreshToken = 'validRefreshToken';
      const mockDecodedToken = {
        sub: mockUser.id,
        username: mockUser.username,
      };

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValueOnce(mockDecodedToken);
      jest
        .spyOn(refreshTokenIdsStorage, 'validate')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce('newAccessToken')
        .mockResolvedValueOnce('newRefreshToken');

      const result = await service.refreshAccessToken(mockRefreshToken);

      expect(result).toEqual({
        access_token: 'newAccessToken',
        refresh_token: 'newRefreshToken',
      });
      expect(refreshTokenIdsStorage.validate).toHaveBeenCalledWith(
        mockUser.id,
        mockRefreshToken,
      );
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('should throw an UnauthorizedException if the refresh token is invalid', async () => {
      const mockRefreshToken = 'invalidRefreshToken';

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValueOnce(new Error('Invalid token'));

      await expect(
        service.refreshAccessToken(mockRefreshToken),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('invalidateToken', () => {
    it('should invalidate the token', async () => {
      const mockAccessToken = 'validAccessToken';
      const mockDecodedToken = {
        sub: 1,
        username: 'testuser',
        email: 'test@test.com',
      };

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValueOnce(mockDecodedToken);
      jest
        .spyOn(refreshTokenIdsStorage, 'invalidate')
        .mockResolvedValueOnce(undefined);

      await service.invalidateToken(mockAccessToken);

      expect(refreshTokenIdsStorage.invalidate).toHaveBeenCalledWith(
        mockDecodedToken.sub,
      );
    });

    it('should throw an UnauthorizedException if the access token is invalid', async () => {
      const mockAccessToken = 'invalidAccessToken';

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValueOnce(new Error('Invalid token'));

      await expect(service.invalidateToken(mockAccessToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
