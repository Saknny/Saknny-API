import { Module } from '@nestjs/common';
import { DatabaseModule } from '@src/configs/database/database.module';
import { Apartment } from '../apartment/entities/apartment.entity/apartment.entity';
import { Favorite } from './entities/favorite-list.entity';
import { FavoriteController } from './controllers/favorite-list.controller';
import { FavoriteService } from './services/favorite-list.service';
import { FavoriteApartment } from './entities/favorite-apartment.entity';

@Module({
  imports: [
    DatabaseModule.forFeature([Favorite, Apartment, FavoriteApartment]),
  ],
  controllers: [FavoriteController],
  providers: [FavoriteService],
  exports: [FavoriteService],
})
export class FavoriteModule {}
