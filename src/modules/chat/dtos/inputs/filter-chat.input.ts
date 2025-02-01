import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

export class ChatIdInput {
  @IsString()
  chatId: string;
}

export class ChatFilterInput {
  @IsString()
  @IsOptional()
  searchKey?: string;
}

export class NullableChatFilterInput {
  @IsOptional()
  @ValidateNested()
  @Type(() => ChatFilterInput)
  filter?: ChatFilterInput;
}
