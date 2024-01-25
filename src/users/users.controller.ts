import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { ErrorResponse } from 'src/types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(
    @Body() registerUserDto: CreateUserDto,
  ): Promise<User | ErrorResponse> {
    try {
      return await this.usersService.create(registerUserDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { message: 'Username already exists', statusCode: 400 };
      } else {
        throw new InternalServerErrorException('Internal server error');
      }
    }
  }

  @Get(':id')
  async findUserById(@Param('id') id: number): Promise<User | ErrorResponse> {
    try {
      return await this.usersService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { message: 'User not found', statusCode: 404 };
      } else {
        throw new InternalServerErrorException('Internal server error');
      }
    }
  }

  @Get('username/:username')
  async findUserByUsername(
    @Param('username') username: string,
  ): Promise<User | ErrorResponse> {
    try {
      return await this.usersService.findByUsername(username);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { message: 'User not found', statusCode: 404 };
      } else {
        throw new InternalServerErrorException('Internal server error');
      }
    }
  }
}
