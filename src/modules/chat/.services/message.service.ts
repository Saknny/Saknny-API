import { Injectable } from '@nestjs/common';
import { sendMessageInput } from '../dtos/inputs/create-message.input';
import { InjectBaseRepository } from '../../../libs/decorators/inject-base-repository.decorator';
import { Chat } from '../entities/chat.entity';
import { BaseRepository } from '../../../libs/types/base-repository';
import { Message } from '../entities/message.entity';
import { ErrorCodeEnum } from '../../../libs/application/exceptions/error-code.enum';
import { User } from '../../user/entities/user.entity';
import { SubScriptionTopicsEnum } from '../enums/chat.enum';
import { BaseHttpException } from '../../../libs/application/exceptions/base-http-exception';
import { RedisPubSubService } from '../../../libs/redis-pubsub/redis.pubsub';
import { CursorPaginatorInput } from '../../../libs/application/paginator/paginator.input';
import { ChatService } from './chat.service';
import { MessageStatus } from '../entities/message.status.entity';
import { In } from 'typeorm';
import { MessageFilterInput } from '../dtos/inputs/filter-message.input';
import { UpdateMessageInput } from '../dtos/inputs/update-message.input';
import { ChatIdInput } from '../dtos/inputs/filter-chat.input';
import { forwardRef, Inject } from '@nestjs/common';

@Injectable()
export class MessageService {
  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly redisPubSubService: RedisPubSubService,
    @InjectBaseRepository(Chat)
    private readonly chatRepo: BaseRepository<Chat>,
    @InjectBaseRepository(Message)
    private readonly messageRepo: BaseRepository<Message>,
    @InjectBaseRepository(MessageStatus)
    private readonly messageStatusRepo: BaseRepository<MessageStatus>,
  ) {}

  // TODO: always direction after and incase next we skip one and in case before we repeat one
  async getChatMessages(
    user: User,
    chatId: string,
    {
      cursor = undefined,
      direction = 'AFTER',
      limit = 15,
    }: CursorPaginatorInput,
  ) {
    if (!(await this.chatService.isUserChat(chatId, user.id)))
      throw new BaseHttpException(ErrorCodeEnum.CHAT_FORBIDDEN);

    const messages = await this.messageRepo.findCursorPaginated(
      { chat: { id: chatId } },
      cursor,
      direction,
      limit,
      'DESC',
      'createdAt',
      'DATE',
      { sender: true },
    );

    return messages;
  }

  async getMessagesInfo(user: User, { chatId, messageId }: MessageFilterInput) {
    if (!(await this.chatService.isUserChat(chatId, user.id)))
      throw new BaseHttpException(ErrorCodeEnum.CHAT_FORBIDDEN);

    const message = await this.messageRepo.findOneOrError(
      { id: messageId, chatId: chatId },
      ErrorCodeEnum.NOT_FOUND,
      { messageStatus: true, sender: true },
    );

    if (message.senderId !== user.id)
      throw new BaseHttpException(ErrorCodeEnum.MESSAGE_FORBIDDEN);

    return message;
  }

  async sendMessage(
    { content, chatId: targetId }: sendMessageInput & ChatIdInput,
    sender: User,
  ) {
    let chat =
      (await this.chatRepo.findOne({ id: targetId }, { chatUsers: true })) ??
      (await this.chatRepo.findOne(
        { chatUsers: { userId: In([sender.id, targetId]) } },
        { chatUsers: { user: true } },
      ));

    if (!chat) {
      if (targetId == sender.id)
        throw new BaseHttpException(ErrorCodeEnum.CANT_SEND_TO_YOURSELF);
      chat = await this.chatService.createPrivateChat(sender, targetId);
    }

    if (chat?.chatUsers.length == 0)
      throw new BaseHttpException(ErrorCodeEnum.CHAT_FORBIDDEN);
    if (!chat.chatUsers.some((chatUser) => chatUser.userId === sender.id))
      throw new BaseHttpException(ErrorCodeEnum.CHAT_FORBIDDEN);

    const createdMessage = await this.messageRepo.createOne({
      chat,
      sender,
      content,
    });

    for (const chatUser of chat.chatUsers) {
      if (chatUser.userId !== sender.id) {
        await this.messageStatusRepo.createOne({
          receiver: chatUser.user,
          receiverId: chatUser.userId,
          message: createdMessage,
        });
      }
    }

    this.redisPubSubService.publish(SubScriptionTopicsEnum.CREATE_MESSAGE, {
      message: createdMessage,
    });
    return createdMessage;
  }

  async updateMessage(
    { chatId, messageId, content }: MessageFilterInput & UpdateMessageInput,
    sender: User,
  ) {
    if (!(await this.chatService.isUserChat(chatId, sender.id)))
      throw new BaseHttpException(ErrorCodeEnum.CHAT_FORBIDDEN);

    const message = await this.messageRepo.findOneOrError(
      { id: messageId, chatId: chatId },
      ErrorCodeEnum.NOT_FOUND,
      { messageStatus: true, sender: true },
    );

    if (message.senderId !== sender.id)
      throw new BaseHttpException(ErrorCodeEnum.MESSAGE_FORBIDDEN);

    const FIFTEEN_MINUTES_MS = 1000 * 60 * 15;
    if (message.createdAt.getTime() + FIFTEEN_MINUTES_MS < Date.now())
      throw new BaseHttpException(ErrorCodeEnum.MESSAGE_UPDATE_TIME_EXPIRED);

    message.content = content;
    const updatedMessage = await this.messageRepo.save(message);

    this.redisPubSubService.publish(SubScriptionTopicsEnum.UPDATE_MESSAGE, {
      message: updatedMessage,
    });
    return true;
  }

  async deleteMessage({ chatId, messageId }: MessageFilterInput, sender: User) {
    if (!(await this.chatService.isUserChat(chatId, sender.id)))
      throw new BaseHttpException(ErrorCodeEnum.CHAT_FORBIDDEN);

    const message = await this.messageRepo.findOneOrError(
      { id: messageId, chatId: chatId },
      ErrorCodeEnum.NOT_FOUND,
    );

    if (message.senderId !== sender.id)
      throw new BaseHttpException(ErrorCodeEnum.MESSAGE_FORBIDDEN);

    const deletedMessage = await this.messageRepo.remove(message);
    this.redisPubSubService.publish(SubScriptionTopicsEnum.DELETE_MESSAGE, {
      message: deletedMessage,
    });
    return true;
  }

  async markMessageSeen(
    messageId: string,
    receiverId: string,
  ): Promise<Message> {
    const latestMessage = await this.messageRepo.findOneOrError(
      { id: messageId },
      ErrorCodeEnum.NOT_FOUND,
    );

    if (!(await this.chatService.isUserChat(latestMessage.chatId, receiverId)))
      throw new BaseHttpException(ErrorCodeEnum.CHAT_FORBIDDEN);

    const latestMessageStatus = await this.messageStatusRepo.findOne({
      messageId: latestMessage.id,
      receiverId,
    });

    if (!latestMessageStatus || !!latestMessageStatus.seenAt) return;

    const endDate = latestMessageStatus.createdAt;

    const messageStatusIds = await this.messageStatusRepo
      .createQueryBuilder('messageStatus')
      .innerJoin('messageStatus.message', 'message')
      .select('messageStatus.id')
      .where('messageStatus.receiverId = :receiverId', { receiverId })
      .andWhere(
        "DATE_TRUNC('milliseconds', messageStatus.createdAt) <= :endDate",
        { endDate },
      )
      .andWhere('messageStatus.seenAt IS NULL')
      .andWhere('message.chatId = :chatId', { chatId: latestMessage.chatId })
      .getMany();

    await this.messageStatusRepo.update(
      { id: In(messageStatusIds.map((ms) => ms.id)) },
      { seenAt: new Date() },
    );

    this.redisPubSubService.publish(SubScriptionTopicsEnum.SEEN_MESSAGE, {
      message: await this.messageRepo.findOne(
        { id: latestMessage.id },
        { messageStatus: true },
      ),
    });

    return latestMessage;
  }

  async markMessageDelivered(messageId: string, receiverId: string) {
    const latestMessage = await this.messageRepo.findOneOrError(
      { id: messageId },
      ErrorCodeEnum.NOT_FOUND,
    );

    if (!(await this.chatService.isUserChat(latestMessage.chatId, receiverId)))
      throw new BaseHttpException(ErrorCodeEnum.CHAT_FORBIDDEN);

    await this.setAllDeliveredMessages(latestMessage, receiverId);
  }

  async setAllDeliveredMessages(latestMessage: Message, receiverId: string) {
    const latestMessageStatus = await this.messageStatusRepo.findOne({
      messageId: latestMessage.id,
      receiverId,
    });

    if (!latestMessageStatus || !!latestMessageStatus.deliveredAt) return;
    const endDate = latestMessageStatus.createdAt;

    const messageStatusIds = await this.messageStatusRepo
      .createQueryBuilder('messageStatus')
      .innerJoin('messageStatus.message', 'message')
      .select('messageStatus.id')
      .where('messageStatus.receiverId = :receiverId', { receiverId })
      .andWhere(
        "DATE_TRUNC('milliseconds', messageStatus.createdAt) <= :endDate",
        { endDate },
      )
      .andWhere('messageStatus.deliveredAt IS NULL')
      .andWhere('message.chatId = :chatId', { chatId: latestMessage.chatId })
      .getMany();

    await this.messageStatusRepo.update(
      { id: In(messageStatusIds.map((ms) => ms.id)) },
      { deliveredAt: new Date() },
    );

    this.redisPubSubService.publish(SubScriptionTopicsEnum.DELIVERED_MESSAGE, {
      message: await this.messageRepo.findOne(
        { id: latestMessage.id },
        { messageStatus: true },
      ),
    });
  }
}
