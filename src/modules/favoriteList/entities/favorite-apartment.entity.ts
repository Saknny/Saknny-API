import { BaseModel } from '@src/libs/database/base.model';
import { DeepPartial } from '@src/libs/types/deep-partial.type';
import { Apartment } from '@src/modules/apartment/entities/apartment.entity/apartment.entity';
import { Entity, ManyToOne } from 'typeorm';
import { Favorite } from './favorite-list.entity';

@Entity()
export class FavoriteApartment extends BaseModel {
  constructor(input?: DeepPartial<FavoriteApartment>) {
    super(input);
  }

  @ManyToOne(() => Favorite, (favorite) => favorite.favoriteApartments, {
    onDelete: 'CASCADE',
  })
  favorite: Favorite;

  @ManyToOne(() => Apartment, { onDelete: 'CASCADE' })
  apartment: Apartment;
}
