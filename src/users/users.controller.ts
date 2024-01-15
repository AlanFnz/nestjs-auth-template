import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() registerUserDto: RegisterUserDto): Promise<User> {
    return this.usersService.create(registerUserDto);
  }

  @Get(':id')
  async findUserById(@Param('id') id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Get('username/:username')
  async findUserByUsername(@Param('username') username: string): Promise<User> {
    return this.usersService.findByUsername(username);
  }
}
