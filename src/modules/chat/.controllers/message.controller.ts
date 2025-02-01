import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { sendMessageInput } from '../dtos/inputs/create-message.input';
import { User } from '../../user/entities/user.entity';
import { UpdateMessageInput } from '../dtos/inputs/update-message.input';
import { MessageFilterInput } from '../dtos/inputs/filter-message.input';
import { RedisPubSubService } from '../../../libs/redis-pubsub/redis.pubsub';
import { currentUser } from '../../../libs/decorators/currentUser.decorator';
import { JwtAuthenticationGuard } from '../../../libs/guards/strategy.guards/jwt.guard';
import { currentUserType } from '../../../libs/types/current-user.type';
import { Serialize } from '../../../libs/interceptors/serialize.interceptor';
import {
  CreatedMessageResponse,
  GetMessageResponse,
  GetMessageWithStatusResponse,
} from '../dtos/outputs/message.response';
import { ChatIdInput } from '../dtos/inputs/filter-chat.input';
import { CursorPaginatorInput } from '../../../libs/application/paginator/paginator.input';
import { CursorBasedPaginatorResponse } from '../../../libs/application/paginator/paginator.response';
import { MessageService } from '../.services/message.service';

@Controller('chats/:chatId/messages')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly redisPubSubService: RedisPubSubService,
  ) {}

  @Get()
  @UseGuards(JwtAuthenticationGuard)
  @Serialize(CursorBasedPaginatorResponse, GetMessageResponse)
  async getChatMessages(
    @Param() { chatId }: ChatIdInput,
    @Query('paginate') paginate: CursorPaginatorInput,
    @currentUser() user: User,
  ) {
    return await this.messageService.getChatMessages(user, chatId, paginate);
  }

  @Get('/:messageId')
  @UseGuards(JwtAuthenticationGuard)
  @Serialize(GetMessageWithStatusResponse)
  async getMessageInfo(
    @Param() filterInput: MessageFilterInput,
    @currentUser() user: User,
  ) {
    return await this.messageService.getMessagesInfo(user, filterInput);
  }

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  @Serialize(CreatedMessageResponse)
  async sendMessage(
    @Param() { chatId }: ChatIdInput,
    @Body() { content }: sendMessageInput,
    @currentUser() sender: currentUserType,
  ) {
    return await this.messageService.sendMessage({ content, chatId }, sender);
  }

  @Patch('/:messageId')
  @UseGuards(JwtAuthenticationGuard)
  async updateMessage(
    @Param() { messageId, chatId }: MessageFilterInput,
    @Body() { content }: UpdateMessageInput,
    @currentUser() sender: User,
  ) {
    return await this.messageService.updateMessage(
      { messageId, chatId, content },
      sender,
    );
  }

  @Delete('/:messageId')
  @UseGuards(JwtAuthenticationGuard)
  async deleteMessage(
    @Param() filterInput: MessageFilterInput,
    @currentUser() sender: User,
  ) {
    return await this.messageService.deleteMessage(filterInput, sender);
  }
}
