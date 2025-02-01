import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTagInput {
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  title: string;
}
