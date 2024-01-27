import { IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { IsUsernameOrEmailNotEmpty } from '../validators/custom-validators';

export class SignInDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  username?: string;

  @IsNotEmpty()
  password: string;

  @IsUsernameOrEmailNotEmpty({
    message: 'Either username or email must be provided',
  })
  usernameOrEmailNotEmpty: boolean;
}
