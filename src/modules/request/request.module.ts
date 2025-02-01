import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { DatabaseModule } from '../../configs/database/database.module';
import { JobRequest } from './entities/request.entity';

@Module({
  imports: [DatabaseModule.forFeature([JobRequest])],
  controllers: [RequestController],
  providers: [RequestService],
})
export class RequestModule {}
