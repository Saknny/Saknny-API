import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../configs/database/database.module';
import { Tag } from './entities/tag.entity';
import { TagController } from './controllers/tag.controller';
import { TagService } from './services/tag.service';

@Module({
  imports: [DatabaseModule.forFeature([Tag])],
  controllers: [TagController],
  providers: [TagService],
})
export class TagModule {}
