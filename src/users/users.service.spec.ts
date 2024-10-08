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

      const findOneSpy = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(undefined);
      const saveSpy = jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue(user);

      const result = await service.create(registerUserDto);

      expect(result).toEqual(user);
      expect(findOneSpy).toHaveBeenCalledWith({
        where: [{ username: 'testuser' }, { email: 'test@test.com' }],
      });
      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'testuser',
          email: 'test@test.com',
          password: expect.any(String), // Matching the password as a string (hashed password)
        }),
      );
    });

    it('should throw ConflictException for existing username', async () => {
      const registerUserDto: CreateUserDto = {
        email: 'test@test.com',
        username: 'existinguser',
        password: 'testpassword',
      };

      const existingUser = new User();
      existingUser.username = 'existinguser';

      const findOneSpy = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(existingUser);

      try {
        await service.create(registerUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe('Username already exists');
        expect(findOneSpy).toHaveBeenCalledWith({
          where: [{ username: 'existinguser' }, { email: 'test@test.com' }],
        });
      }
    });

    it('should throw ConflictException for existing email', async () => {
      const registerUserDto: CreateUserDto = {
        email: 'existing@test.com',
        username: 'newuser',
        password: 'testpassword',
      };

      const existingUser = new User();
      existingUser.email = 'existing@test.com';

      const findOneSpy = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(existingUser);

      try {
        await service.create(registerUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe('Email already in use');
        expect(findOneSpy).toHaveBeenCalledWith({
          where: [{ username: 'newuser' }, { email: 'existing@test.com' }],
        });
      }
    });
  });

  describe('findOne', () => {
    it('should find a user by ID', async () => {
      const userId = 1;
      const user = new User();
      user.id = userId;

      const findOneSpy = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(user);

      const result = await service.findOne(userId);

      expect(result).toEqual(user);
      expect(findOneSpy).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('should throw NotFoundException for non-existent ID', async () => {
      const userId = 1;

      const findOneSpy = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(undefined);

      try {
        await service.findOne(userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('User not found');
        expect(findOneSpy).toHaveBeenCalledWith({ where: { id: userId } });
      }
    });
  });

  describe('findByUsername', () => {
    it('should find a user by username', async () => {
      const username = 'testuser';
      const user = new User();
      user.username = username;

      const findOneSpy = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(user);

      const result = await service.findByUsername(username);

      expect(result).toEqual(user);
      expect(findOneSpy).toHaveBeenCalledWith({ where: { username } });
    });

    it('should throw NotFoundException for non-existent username', async () => {
      const username = 'nonexistentuser';

      const findOneSpy = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(undefined);

      try {
        await service.findByUsername(username);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('User not found');
        expect(findOneSpy).toHaveBeenCalledWith({ where: { username } });
      }
    });
  });
});
