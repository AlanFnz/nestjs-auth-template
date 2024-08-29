import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshTokenGuard } from './guards/jwt-refresh-token.guard';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signIn: jest.fn(),
            refreshAccessToken: jest.fn(),
            invalidateToken: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({})
      .overrideGuard(JwtRefreshTokenGuard)
      .useValue({})
      .compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signUp', () => {
    it('should call usersService.create with the correct data', async () => {
      const createUserDto: CreateUserDto = {
        username: 'test',
        password: '12345',
        email: 'test@test.com',
      };
      await authController.signUp(createUserDto);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('signIn', () => {
    it('should call authService.signIn with the correct data', async () => {
      const signInDto: SignInDto = { username: 'test', password: '12345' };
      await authController.signIn(signInDto);
      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
    });
  });

  describe('refreshToken', () => {
    it('should call authService.refreshAccessToken with the correct data', async () => {
      const refreshTokenDto = { refresh_token: 'some-refresh-token' };
      await authController.refreshToken(refreshTokenDto);
      expect(authService.refreshAccessToken).toHaveBeenCalledWith(
        refreshTokenDto.refresh_token,
      );
    });
  });

  describe('invalidateToken', () => {
    it('should call authService.invalidateToken with the correct data', async () => {
      const token = 'some-access-token';
      await authController.invalidateToken(`Bearer ${token}`);
      expect(authService.invalidateToken).toHaveBeenCalledWith(token);
    });
  });
});
