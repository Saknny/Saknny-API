import { ValidateBy, ValidationOptions } from 'class-validator';

export function IsNotBlank(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isNotBlank',
      constraints: [],
      validator: {
        validate(value: any) {
          return typeof value === 'string' && value.trim().length > 0;
        },
        defaultMessage: (options) => `${options.property} must not be blank`,
      },
    },
    validationOptions,
  );
}
