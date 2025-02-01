import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPostalCode,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  PaymentCurrencyEnum,
  PaymentMethodEnum,
} from '../../enum/payment.enum';
import { Type } from 'class-transformer';

export class customerData {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  givenName: string;

  @IsString()
  @IsNotEmpty()
  surname: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsPostalCode('any')
  postcode: string;
}

export class CreateCheckoutInput {
  @IsEnum(PaymentMethodEnum)
  paymentMethod: PaymentMethodEnum;

  @IsNumber()
  amount: number;

  @IsEnum(PaymentCurrencyEnum)
  currency: PaymentCurrencyEnum;

  @ValidateNested()
  @Type(() => customerData)
  customerData: customerData;

  @IsString()
  merchantTransactionId: string;
}
