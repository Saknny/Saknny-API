import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { DatabaseModule } from '../../configs/database/database.module';

@Module({
  imports: [DatabaseModule.forFeature([]), CommandModule],
  providers: [],
})
export class SeedsModule {}
