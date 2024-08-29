import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsUsernameOrEmailNotEmptyConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const object = args.object as any;
    return !!object.username || !!object.email;
  }

  defaultMessage() {
    return 'Either username or email must be provided';
  }
}

export function IsUsernameOrEmailNotEmpty(
  validationOptions?: ValidationOptions,
) {
  return function <T extends { new (...args: any[]): object }>(constructor: T) {
    registerDecorator({
      target: constructor.prototype,
      propertyName: undefined,
      options: validationOptions,
      constraints: [],
      validator: IsUsernameOrEmailNotEmptyConstraint,
    });
  };
}
