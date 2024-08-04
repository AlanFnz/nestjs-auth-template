import { IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { IsUsernameOrEmailNotEmpty } from '../validators/custom-validators';
import { TEXTS } from '../../constants/texts';

export class SignInDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  username?: string;

  @IsNotEmpty()
  password: string;

  @IsUsernameOrEmailNotEmpty({
    message: TEXTS.MESSAGES.AUTH.VALIDATIONS.USER_OR_EMAIL_NOT_EMPTY,
  })
  usernameOrEmailNotEmpty: boolean;
}
