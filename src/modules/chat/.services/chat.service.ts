import { Injectable } from '@nestjs/common';
import { InjectBaseRepository } from '../../../libs/decorators/inject-base-repository.decorator';
import { Chat } from '../entities/chat.entity';
import { BaseRepository } from '../../../libs/types/base-repository';
import { ErrorCodeEnum } from '../../../libs/application/exceptions/error-code.enum';
import { User } from '../../user/entities/user.entity';
import { BaseHttpException } from '../../../libs/application/exceptions/base-http-exception';
import { Brackets, In, IsNull } from 'typeorm';
import { PaginatorInput } from '../../../libs/application/paginator/paginator.input';
import { ChatFilterInput } from '../dtos/inputs/filter-chat.input';
import { ChatUser } from '../entities/chat-user.entity';
import { MessageService } from './message.service';
import { forwardRef, Inject } from '@nestjs/common';
import { Message } from '../entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @Inject(forwardRef(() => MessageService))
    private readonly messageService: MessageService,
    @InjectBaseRepository(User)
    private readonly userRepo: BaseRepository<User>,
    @InjectBaseRepository(Chat)
    private readonly chatRepo: BaseRepository<Chat>,
    @InjectBaseRepository(ChatUser)
    private readonly chatUserRepo: BaseRepository<ChatUser>,
    @InjectBaseRepository(Message)
    private readonly messageRepo: BaseRepository<Message>,
  ) {}

  async isUserChat(chatId: string, userId: string): Promise<boolean> {
    const chat = await this.chatUserRepo.findOne({
      chatId: chatId,
      userId: userId,
    });
    return !chat ? false : true;
  }

  async findFriendChat(friendId: string, userId: string): Promise<Chat | null> {
    const chat = await this.chatRepo.findOne(
      { chatUsers: { userId: In([userId, friendId]) } },
      { chatUsers: true },
    );

    return chat || null;
  }

  async getChats(
    user: User,
    filter: ChatFilterInput,
    { page, limit }: PaginatorInput,
  ) {
    const searchKey = filter?.searchKey || '';
    const skip = (page - 1) * limit;

    const chatQuery = this.chatRepo
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.users', 'users')
      .leftJoinAndSelect('chat.chatUsers', 'chatUsers')
      .leftJoinAndSelect('chatUsers.user', 'user')
      .leftJoinAndSelect('users.individual', 'individual')
      .leftJoinAndSelect('users.organization', 'organization')
      .where('chatUsers.userId = :userId', { userId: user.id })
      .andWhere(
        new Brackets((qb) => {
          qb.where('individual.fullName ILIKE :searchKey', {
            searchKey: `%${searchKey}%`,
          }).orWhere('organization.name ILIKE :searchKey', {
            searchKey: `%${searchKey}%`,
          });
        }),
      )
      .skip(skip)
      .take(limit);

    const chats = await chatQuery.getMany();
    const total = await chatQuery.getCount();

    for (const chat of chats) {
      chat['friend'] = chat.users.find((u) => u.id !== user.id);
      delete chat.chatUsers;
    }

    const { items: messages } = await this.messageRepo.findPaginated(
      { chatId: In(chats.map((chat) => chat.id)) },
      { createdAt: 'DESC' },
      1,
      1,
    );
    //FIXME : Remember to check the result of messages after applying limit

    for (const chat of chats) {
      const message = messages.find((m) => m.chatId === chat.id);

      await this.messageService.setAllDeliveredMessages(message, user.id);
      chat['latestMessage'] = message;
      chat['unseenMessagesCount'] = await this.messageRepo.count({
        where: {
          chatId: chat.id,
          messageStatus: { receiverId: user.id, seenAt: IsNull() },
        },
      });

      delete chat.chatUsers;
    }

    chats.sort((a, b) => {
      const aCreatedAt = a.messages?.[0]?.createdAt;
      const bCreatedAt = b.messages?.[0]?.createdAt;

      if (aCreatedAt && bCreatedAt)
        return new Date(bCreatedAt).getTime() - new Date(aCreatedAt).getTime();

      return 0;
    });

    return {
      items: chats,
      pageInfo: {
        page,
        limit,
        hasBefore: page > 1,
        hasNext: skip + chats.length < total,
        totalCount: total,
      },
    };
  }

  async getChatInfo(user: User, chatId: string) {
    if (!(await this.isUserChat(chatId, user.id)))
      throw new BaseHttpException(ErrorCodeEnum.CHAT_FORBIDDEN);

    return await this.chatRepo.findOne({ id: chatId }, { users: true });
  }

  async createPrivateChat(sender: User, receiverId: string): Promise<Chat> {
    const receiver = await this.userRepo.findOneOrError(
      { id: receiverId },
      ErrorCodeEnum.RECEIVER_NOT_FOUND,
    );

    const chat = await this.chatRepo.createOne({});
    await this.chatUserRepo.bulkCreate([
      { chat, user: sender },
      { chat, user: receiver },
    ]);

    return await this.chatRepo.findOne({ id: chat.id }, { chatUsers: true });
  }
}
