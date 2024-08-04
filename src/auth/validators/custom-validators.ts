import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { TEXTS } from '../../constants/texts';

@ValidatorConstraint({ async: false })
export class IsUsernameOrEmailNotEmptyConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const object = args.object as any;
    return object.username || object.email;
  }

  defaultMessage() {
    return TEXTS.MESSAGES.AUTH.VALIDATIONS.USER_OR_EMAIL_NOT_EMPTY;
  }
}

export function IsUsernameOrEmailNotEmpty(
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUsernameOrEmailNotEmptyConstraint,
    });
  };
}
