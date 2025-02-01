import { Module } from '@nestjs/common';
import { ChatService } from './.services/chat.service';
import { DatabaseModule } from '../../configs/database/database.module';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { PubSubModule } from '../../libs/redis-pubsub/pubsub.module';
import { ChatGateway } from './chat.gateway';
import { User } from '../user/entities/user.entity';
import { ChatController } from './.controllers/chat.controller';
import { MessageController } from './.controllers/message.controller';
import { MessageService } from './.services/message.service';
import { MessageStatus } from './entities/message.status.entity';
import { ChatUser } from './entities/chat-user.entity';

@Module({
  imports: [
    PubSubModule,
    DatabaseModule.forFeature([User, Chat, Message, MessageStatus, ChatUser]),
  ],
  controllers: [ChatController, MessageController],
  providers: [ChatGateway, ChatService, MessageService],
})
export class ChatModule {}
