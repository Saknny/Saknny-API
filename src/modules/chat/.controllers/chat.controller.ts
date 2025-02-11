import { ChatService } from '../.services/chat.service';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';
import { ChatFilterInput, ChatIdInput } from '../dtos/inputs/filter-chat.input';
import { RedisPubSubService } from '../../../libs/redis-pubsub/redis.pubsub';
import { currentUser } from '../../../libs/decorators/currentUser.decorator';
import { JwtAuthenticationGuard } from '../../../libs/guards/strategy.guards/jwt.guard';
import { Serialize } from '../../../libs/interceptors/serialize.interceptor';
import { PaginatorResponse } from '../../../libs/application/paginator/paginator.response';
import { PaginatorInput } from '../../../libs/application/paginator/paginator.input';
import { GetChatWithFriendsResponse } from '../dtos/outputs/chat.response';
import { Auth } from '@src/libs/decorators/auth.decorator';

@Controller('chats')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly redisPubSubService: RedisPubSubService,
  ) {}

  @Get()
  @Auth({ allow: 'authenticated' })
  @Serialize(PaginatorResponse, GetChatWithFriendsResponse)
  async getChats(
    @currentUser() user: User,
    @Query('filter') filter: ChatFilterInput,
    @Query('paginate') paginate: PaginatorInput,
  ) {
    if (!paginate) paginate = { page: 1, limit: 15 };
    return await this.chatService.getChats(user, filter, paginate);
  }

  @Get('/:chatId')
  @Auth({ allow: 'authenticated' })
  @Serialize(GetChatWithFriendsResponse)
  async getChat(@Param() { chatId }: ChatIdInput, @currentUser() user: User) {
    return await this.chatService.getChatInfo(user, chatId);
  }
}
