import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoriteList } from '../entities/favorite-list.entity';
import { Apartment } from '@src/modules/apartment/entities/apartment.entity/apartment.entity';
import { InjectBaseRepository } from '@src/libs/decorators/inject-base-repository.decorator';
import { BaseRepository } from '@src/libs/types/base-repository';
import { ErrorCodeEnum } from '@src/libs/application/exceptions/error-code.enum';
import { BaseHttpException } from '@src/libs/application/exceptions/base-http-exception';

// TODO: need to test
@Injectable()
export class FavoriteListService {
  constructor(
    @InjectBaseRepository(FavoriteList)
    private favoriteListRepo: BaseRepository<FavoriteList>,
    @InjectBaseRepository(Apartment)
    private apartmentRepo: BaseRepository<Apartment>,
  ) {}

  async createFavoriteList(studentId: string, name: string) {
    const favoriteList = this.favoriteListRepo.createOne({
      name,
      studentId,
    });

    return favoriteList;
  }

  async renameFavoriteList(studentId: string, listId: string, newName: string) {
    const favoriteList = await this.favoriteListRepo.findOneOrError(
      { id: listId, student: { id: studentId } },
      ErrorCodeEnum.FAVORITE_LIST_NOT_FOUND,
    );

    favoriteList.name = newName;
    return this.favoriteListRepo.save(favoriteList);
  }

  async deleteFavoriteList(studentId: string, listId: string) {
    const favoriteList = await this.favoriteListRepo.findOneOrError(
      { id: listId, student: { id: studentId } },
      ErrorCodeEnum.FAVORITE_LIST_NOT_FOUND,
    );

    return this.favoriteListRepo.remove(favoriteList);
  }

  async addApartmentToFavoriteList(
    studentId: string,
    listId: string,
    apartmentId: string,
  ) {
    const favoriteList = await this.favoriteListRepo.findOneOrError(
      { id: listId, student: { id: studentId } },
      ErrorCodeEnum.FAVORITE_LIST_NOT_FOUND,
    );

    const apartment = await this.apartmentRepo.findOneOrError(
      { id: apartmentId },
      ErrorCodeEnum.APARTMENT_NOT_FOUND,
    );

    // Assign the apartment to the favorite list
    apartment.favoriteList = favoriteList;
    return this.apartmentRepo.save(apartment);
  }

  async removeApartmentFromFavoriteList(
    studentId: string,
    apartmentId: string,
  ) {
    const apartment = await this.apartmentRepo.findOneOrError(
      { id: apartmentId },
      ErrorCodeEnum.APARTMENT_NOT_FOUND,
      ['favoriteList'],
    );

    if (!apartment || apartment.favoriteList?.student?.id !== studentId) {
      throw new BaseHttpException(ErrorCodeEnum.APARTMENT_NOT_FOUND);
    }

    // Remove the relation
    apartment.favoriteList = null;
    return this.apartmentRepo.save(apartment);
  }

  async getUserFavoriteLists(userId: number) {
    return this.favoriteListRepo
      .createQueryBuilder('favoriteList')
      .leftJoinAndSelect('favoriteList.apartments', 'favoriteListApartment')
      .leftJoinAndSelect('favoriteListApartment.apartment', 'apartment')
      .orderBy('favoriteListApartment.addedAt', 'DESC')
      .select(['favoriteList.id', 'favoriteList.name', 'apartment.image'])
      .getMany();
  }

  async getFavoriteListApartments(studentId: string, listId: string) {
    return this.apartmentRepo.find({
      where: { favoriteList: { id: listId, student: { id: studentId } } },
      order: { createdAt: 'DESC' },
      select: ['id', 'descriptionEn', 'descriptionAr', 'images'],
    });
  }
}
