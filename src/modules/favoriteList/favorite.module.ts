import { Module } from '@nestjs/common';
import { FavoriteListController } from './controllers/favorite-list.controller';
import { FavoriteListService } from './services/favorite-list.service';
import { DatabaseModule } from '@src/configs/database/database.module';
import { FavoriteList } from './entities/favorite-list.entity';
import { Apartment } from '../apartment/entities/apartment.entity/apartment.entity';

@Module({
  imports: [DatabaseModule.forFeature([FavoriteList, Apartment])],
  controllers: [FavoriteListController],
  providers: [FavoriteListService],
  exports: [FavoriteListService],
})
export class FavoriteModule {}
