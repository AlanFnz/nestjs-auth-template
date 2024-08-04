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
    private userRepository: Repository<User>,
  ) {}

  async create(registerUserDto: CreateUserDto): Promise<User> {
    const { username, email, password } = registerUserDto;

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
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User();
    user.username = username;
    user.email = email;
    user.password = hashedPassword;

    return this.userRepository.save(user);
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(TEXTS.MESSAGES.USER.USER_NOT_FOUND);
    }
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(TEXTS.MESSAGES.USER.USER_NOT_FOUND);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(TEXTS.MESSAGES.USER.USER_NOT_FOUND);
    }
    return user;
  }

  async findByUsernameOrEmail(
    username?: string,
    email?: string,
  ): Promise<User> {
    let user: User;
    if (email) {
      user = await this.userRepository.findOne({ where: { email } });
    } else if (username) {
      user = await this.userRepository.findOne({ where: { username } });
    }

    return user;
  }
}
