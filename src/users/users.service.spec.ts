import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const registerUserDto: CreateUserDto = {
        email: 'test@test.com',
        username: 'testuser',
        password: 'testpassword',
      };

      const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);

      const user = new User();
      user.username = 'testuser';
      user.email = 'test@test.com';
      user.password = hashedPassword;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);
      jest
        .spyOn(userRepository, 'create')
        .mockImplementation((entity) => entity as User);

      const result = await service.create(registerUserDto);

      expect(result).toEqual(user);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: [{ username: 'testuser' }, { email: 'test@test.com' }],
      });
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'testuser',
          email: 'test@test.com',
          password: expect.any(String),
        }),
      );
    });

    it('should throw ConflictException for existing username or email', async () => {
      const registerUserDto: CreateUserDto = {
        email: 'test@test.com',
        username: 'existinguser',
        password: 'testpassword',
      };

      const existingUser = new User();
      existingUser.username = 'existinguser';
      existingUser.email = 'test@test.com';

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(existingUser);

      await expect(service.create(registerUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should find a user by ID', async () => {
      const userId = 1;
      const user = new User();
      user.id = userId;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await service.findOne(userId);

      expect(result).toEqual(user);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 1;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUsernameOrEmail', () => {
    it('should find a user by username or email', async () => {
      const username = 'testuser';
      const email = 'test@test.com';

      const user = new User();
      user.username = username;
      user.email = email;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const resultByUsername = await service.findByUsernameOrEmail(username);
      const resultByEmail = await service.findByUsernameOrEmail(
        undefined,
        email,
      );

      expect(resultByUsername).toEqual(user);
      expect(resultByEmail).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      await expect(
        service.findByUsernameOrEmail('nonexistentuser'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
