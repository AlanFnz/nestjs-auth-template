import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { TEXTS } from 'src/constants/texts';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(registerUserDto: CreateUserDto): Promise<User> {
    const { username, email, password } = registerUserDto;

    await this.ensureUserDoesNotExist(username, email);

    const hashedPassword = await this.hashPassword(password);
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async findOne(id: number): Promise<User> {
    return this.findUserOrThrow({ id });
  }

  async findByUsername(username: string): Promise<User> {
    return this.findUserOrThrow({ username });
  }

  async findByEmail(email: string): Promise<User> {
    return this.findUserOrThrow({ email });
  }

  async findByUsernameOrEmail(
    username?: string,
    email?: string,
  ): Promise<User> {
    if (!username && !email) {
      throw new NotFoundException(TEXTS.MESSAGES.USER.USER_NOT_FOUND);
    }

    const user = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });

    if (!user) {
      throw new NotFoundException(TEXTS.MESSAGES.USER.USER_NOT_FOUND);
    }
    return user;
  }

  private async findUserOrThrow(criteria: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOne({ where: criteria });
    if (!user) {
      throw new NotFoundException(TEXTS.MESSAGES.USER.USER_NOT_FOUND);
    }
    return user;
  }

  private async ensureUserDoesNotExist(
    username: string,
    email: string,
  ): Promise<void> {
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ConflictException(
        existingUser.username === username
          ? TEXTS.MESSAGES.USER.USERNAME_ALREADY_EXISTS
          : TEXTS.MESSAGES.USER.EMAIL_EXISTS,
      );
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
}
