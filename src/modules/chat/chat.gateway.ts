import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { RedisPubSubService } from '../../libs/redis-pubsub/redis.pubsub'; // Redis PubSub Service
import { ClientEventsEnum, SubScriptionTopicsEnum } from './enums/chat.enum';
import { ChatService } from './.services/chat.service';
import {
  IContextAuthService,
  IContextAuthServiceToken,
} from '../../libs/application/context/context-auth.interface';
import { plainToInstance } from 'class-transformer';
import {
  CreatedMessageResponse,
  DeletedMessageResponse,
  DeliveredMessageResponse,
  SeenMessageResponse,
  UpdatedMessageResponse,
} from './dtos/outputs/message.response';
import { OnlineStatusResponse } from './dtos/outputs/online-status.response';
import { WebsocketExceptionsFilter } from '../../libs/application/exceptions/exception-filter';
import { TypingStatusInput } from './dtos/inputs/typing-status.input';
import { MessageService } from './.services/message.service';
import { Message } from './entities/message.entity';
import { SeenMessageInput } from './dtos/inputs/seen-message.input';
import { TypingStatusResponse } from './dtos/outputs/typing.status.response';

@WebSocketGateway({ namespace: '/chat', cors: true })
@UseFilters(WebsocketExceptionsFilter)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    @Inject(IContextAuthServiceToken)
    private readonly authService: IContextAuthService,
    private readonly redisPubSubService: RedisPubSubService,
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const user = await this.authService.getUserFromReqHeaders(
        client.handshake as any,
      );

      client.data = { userId: user.id };

      this.subscribeToOnlineStatus(client);
      this.subscribeToTypingStatus(client);
      this.subscribeToSeenMessageEvent(client);
      this.subscribeToCreateMessageEvent(client);
      this.subscribeToUpdateMessageEvent(client);
      this.subscribeToDeleteMessageEvent(client);
      this.subscribeToDeliverMessageEvent(client);

      this.redisPubSubService.publish(SubScriptionTopicsEnum.ONLINE_STATUS, {
        isOnline: true,
        userId: user.id,
      });
    } catch {
      client.disconnect(true);
      // throw new WsException({
      //   status: 'error',
      //   message: error.message || 'Invalid credentials.',
      // });
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    const { userId, typing } = client.data;

    this.redisPubSubService.unsubscribeFromAllChannels(client.id);

    if (!userId) return;
    this.redisPubSubService.publish(SubScriptionTopicsEnum.ONLINE_STATUS, {
      userId,
      isOnline: false,
    });

    if (!typing) return;
    this.redisPubSubService.publish(SubScriptionTopicsEnum.TYPING_STATUS, {
      userId,
      isTyping: false,
    });
  }

  @SubscribeMessage(SubScriptionTopicsEnum.CREATE_MESSAGE)
  async subscribeToCreateMessageEvent(@ConnectedSocket() client: Socket) {
    const { userId } = client.data;

    this.redisPubSubService.subscribeToChannel(
      client.id,
      SubScriptionTopicsEnum.CREATE_MESSAGE,
      async (channel, payload) => {
        const { message } = payload;

        if (message.senderId === userId) return;
        if (await this.chatService.isUserChat(message.chat.id, userId)) {
          this.server.to(client.id).emit(
            channel,
            plainToInstance(CreatedMessageResponse, message, {
              excludeExtraneousValues: true,
              enableImplicitConversion: true,
            }),
          );

          await this.messageService.markMessageDelivered(message.id, userId);
        }
      },
    );
  }

  @SubscribeMessage(SubScriptionTopicsEnum.UPDATE_MESSAGE)
  async subscribeToUpdateMessageEvent(@ConnectedSocket() client: Socket) {
    const { userId } = client.data;

    this.redisPubSubService.subscribeToChannel(
      client.id,
      SubScriptionTopicsEnum.UPDATE_MESSAGE,
      async (channel, payload) => {
        const message = payload?.message as Message;

        if (message.senderId === userId) return;
        if (await this.chatService.isUserChat(message.chatId, userId)) {
          this.server.to(client.id).emit(
            channel,
            plainToInstance(UpdatedMessageResponse, message, {
              excludeExtraneousValues: true,
              enableImplicitConversion: true,
            }),
          );
        }
      },
    );
  }

  @SubscribeMessage(SubScriptionTopicsEnum.DELETE_MESSAGE)
  async subscribeToDeleteMessageEvent(@ConnectedSocket() client: Socket) {
    const { userId } = client.data;

    this.redisPubSubService.subscribeToChannel(
      client.id,
      SubScriptionTopicsEnum.DELETE_MESSAGE,
      async (channel, payload) => {
        const message = payload?.message as Message;

        if (message.senderId === userId) return;
        if (await this.chatService.isUserChat(message.chatId, userId)) {
          this.server.to(client.id).emit(
            channel,
            plainToInstance(DeletedMessageResponse, message, {
              excludeExtraneousValues: true,
              enableImplicitConversion: true,
            }),
          );
        }
      },
    );
  }

  @SubscribeMessage(SubScriptionTopicsEnum.DELIVERED_MESSAGE)
  async subscribeToDeliverMessageEvent(@ConnectedSocket() client: Socket) {
    const { userId } = client.data;

    this.redisPubSubService.subscribeToChannel(
      client.id,
      SubScriptionTopicsEnum.DELIVERED_MESSAGE,
      async (channel, payload) => {
        const message = payload?.message as Message;

        if (message.senderId !== userId) return;
        if (await this.chatService.isUserChat(message.chatId, userId)) {
          const [receiverMessageStatus] = message.messageStatus.filter(
            (status) => status.receiverId !== userId,
          );

          this.server.to(client.id).emit(
            channel,
            plainToInstance(
              DeliveredMessageResponse,
              { ...message, deliveredAt: receiverMessageStatus?.deliveredAt },
              {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
              },
            ),
          );
        }
      },
    );
  }

  @SubscribeMessage(SubScriptionTopicsEnum.SEEN_MESSAGE)
  async subscribeToSeenMessageEvent(@ConnectedSocket() client: Socket) {
    const { userId } = client.data;

    this.redisPubSubService.subscribeToChannel(
      client.id,
      SubScriptionTopicsEnum.SEEN_MESSAGE,
      async (channel, payload) => {
        const message = payload?.message as Message;

        if (message.senderId !== userId) return;
        if (await this.chatService.isUserChat(message.chatId, userId)) {
          const [receiverMessageStatus] = message.messageStatus.filter(
            (status) => status.receiverId !== userId,
          );

          this.server.to(client.id).emit(
            channel,
            plainToInstance(
              SeenMessageResponse,
              { ...message, seenAt: receiverMessageStatus?.seenAt },
              {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
              },
            ),
          );
        }
      },
    );
  }

  @SubscribeMessage(SubScriptionTopicsEnum.ONLINE_STATUS)
  async subscribeToOnlineStatus(@ConnectedSocket() client: Socket) {
    const { userId } = client.data;

    this.redisPubSubService.subscribeToChannel(
      client.id,
      SubScriptionTopicsEnum.ONLINE_STATUS,
      async (channel, payload) => {
        const { userId: friendId, isOnline } = payload;

        if (friendId === userId) return;
        const chat = await this.chatService.findFriendChat(friendId, userId);
        if (chat) {
          this.server.to(client.id).emit(
            channel,
            plainToInstance(
              OnlineStatusResponse,
              { chatId: chat.id, isOnline },
              {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
              },
            ),
          );
        }
      },
    );
  }

  @SubscribeMessage(SubScriptionTopicsEnum.TYPING_STATUS)
  async subscribeToTypingStatus(@ConnectedSocket() client: Socket) {
    const { userId } = client.data;

    this.redisPubSubService.subscribeToChannel(
      client.id,
      SubScriptionTopicsEnum.TYPING_STATUS,
      async (channel, payload) => {
        const { userId: friendId, isTyping } = payload;

        if (friendId === userId) return;
        const chat = await this.chatService.findFriendChat(friendId, userId);

        if (chat) {
          this.server.to(client.id).emit(
            channel,
            plainToInstance(
              TypingStatusResponse,
              { chatId: chat.id, isTyping },
              {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
              },
            ),
          );
        }
      },
    );
  }

  // subscribe to message seen

  // subscribe to message delivered

  //---------------------------------Client Actions---------------------------------//

  @SubscribeMessage(ClientEventsEnum.MY_TYPING_STATUS)
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() { isTyping }: TypingStatusInput,
  ) {
    const { userId, typing } = client.data;
    if (typing === isTyping) return;

    client.data.typing = isTyping;
    this.redisPubSubService.publish(SubScriptionTopicsEnum.TYPING_STATUS, {
      userId,
      isTyping,
    });
  }

  @SubscribeMessage(ClientEventsEnum.MY_SEEN_MESSAGE)
  async handleSeenMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() { messageId }: SeenMessageInput,
  ) {
    const { userId } = client.data;

    const message = await this.messageService.markMessageSeen(
      messageId,
      userId,
    );

    if (message) {
      this.redisPubSubService.publish(SubScriptionTopicsEnum.SEEN_MESSAGE, {
        message,
      });
    }
  }
}
