import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validatePassword(username: string, password: string): Promise<boolean> {
    const user = await this.usersService.findByUsername(username);
    if (user && user.password) {
      return bcrypt.compare(password, user.password);
    }
    return false;
  }
}
