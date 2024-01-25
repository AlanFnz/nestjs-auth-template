import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService], // Add the UsersService provider
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const registerUserDto: CreateUserDto = {
        email: 'test@test.com',
        username: 'testuser',
        password: 'testpassword',
      };

      const user: User = new User();
      user.username = 'testuser';
      // Mock the createUser method to return the user
      jest.spyOn(usersService, 'create').mockResolvedValue(user);

      const result = await controller.createUser(registerUserDto);
      expect(result).toBe(user);
    });

    it('should handle a username already exists error', async () => {
      const registerUserDto: CreateUserDto = {
        email: 'test@test.com',
        username: 'existinguser',
        password: 'testpassword',
      };

      // Mock the createUser method to throw a NotFoundException
      jest
        .spyOn(usersService, 'create')
        .mockRejectedValue(new NotFoundException());

      const result = await controller.createUser(registerUserDto);
      expect(result).toEqual({
        message: 'Username already exists',
        statusCode: 400,
      });
    });

    it('should handle other server errors', async () => {
      const registerUserDto: CreateUserDto = {
        email: 'test@test.com',
        username: 'testuser',
        password: 'testpassword',
      };

      // Mock the createUser method to throw an InternalServerErrorException
      jest
        .spyOn(usersService, 'create')
        .mockRejectedValue(new InternalServerErrorException());

      try {
        await controller.createUser(registerUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('findUserById', () => {
    it('should find a user by ID', async () => {
      const userId = 1;
      const user: User = new User();
      user.id = userId;
      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);

      const result = await controller.findUserById(userId);
      expect(result).toBe(user);
    });

    it('should handle user not found by ID', async () => {
      const userId = 1;
      jest
        .spyOn(usersService, 'findOne')
        .mockRejectedValue(new NotFoundException());

      const result = await controller.findUserById(userId);
      expect(result).toEqual({ message: 'User not found', statusCode: 404 });
    });

    it('should handle other server errors for findUserById', async () => {
      const userId = 1;
      jest
        .spyOn(usersService, 'findOne')
        .mockRejectedValue(new InternalServerErrorException());

      try {
        await controller.findUserById(userId);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('findUserByUsername', () => {
    it('should find a user by username', async () => {
      const username = 'testuser';
      const user: User = new User();
      user.username = username;
      jest.spyOn(usersService, 'findByUsername').mockResolvedValue(user);

      const result = await controller.findUserByUsername(username);
      expect(result).toBe(user);
    });

    it('should handle user not found by username', async () => {
      const username = 'nonexistentuser';
      jest
        .spyOn(usersService, 'findByUsername')
        .mockRejectedValue(new NotFoundException());

      const result = await controller.findUserByUsername(username);
      expect(result).toEqual({ message: 'User not found', statusCode: 404 });
    });

    it('should handle other server errors for findUserByUsername', async () => {
      const username = 'testuser';
      jest
        .spyOn(usersService, 'findByUsername')
        .mockRejectedValue(new InternalServerErrorException());

      try {
        await controller.findUserByUsername(username);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });
});
