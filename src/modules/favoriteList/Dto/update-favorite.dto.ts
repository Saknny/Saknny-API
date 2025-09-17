import { IsNotBlank } from '@src/libs/utils/validators/not-bank.validator';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateFavoriteInput {
  @IsNotBlank()
  id: string;

  @IsNotBlank()
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  name: string;
}
