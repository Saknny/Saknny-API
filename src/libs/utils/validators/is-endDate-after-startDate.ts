import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsEndDateAfterStartDate', async: false })
export class IsEndDateAfterStartDate implements ValidatorConstraintInterface {
  validate(endDate: Date, args: ValidationArguments): boolean {
    const object = args.object as any;
    const startDate = object.startDate;

    return endDate > startDate;
  }

  defaultMessage(): string {
    return ' EndDate must be greater than startDate';
  }
}
