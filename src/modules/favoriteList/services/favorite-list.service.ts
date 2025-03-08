import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoriteApartment } from '../entities/favorite-apartment.entity';
import { Favorite } from '../entities/favorite-list.entity';
import { Apartment } from '@src/modules/apartment/entities/apartment.entity/apartment.entity';
import { UpdateFavoriteInput } from '../Dto/update-favorite.dto';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,

    @InjectRepository(FavoriteApartment)
    private readonly favoriteApartmentRepo: Repository<FavoriteApartment>,

    @InjectRepository(Apartment)
    private readonly apartmentRepo: Repository<Apartment>,
  ) {}

  async getFavoriteLists(
    studentId: string,
    pagination: { limit: number; page: number },
  ) {
    return await this.favoriteRepo.find({
      where: { student: { id: studentId } },
      take: pagination.limit,
      skip: (pagination.page - 1) * pagination.limit,
    });
  }

  async createFavorite(name: string, studentId: string) {
    const favorite = this.favoriteRepo.create({
      name,
      student: { id: studentId },
    });
    return await this.favoriteRepo.save(favorite);
  }

  async updateFavorite(input: UpdateFavoriteInput) {
    await this.favoriteRepo.update(input.id, { name: input.name });
    return this.favoriteRepo.findOne({ where: { id: input.id } });
  }

  async deleteFavorite(favoriteId: string) {
    return await this.favoriteRepo.delete(favoriteId);
  }

  async addApartmentToFavoriteList(
    apartmentId: string,
    favoriteId: string,
    studentId: string,
  ) {
    const favorite = await this.favoriteRepo.findOne({
      where: { id: favoriteId, student: { id: studentId } },
    });

    if (!favorite) throw new Error('Favorite list not found');

    const apartment = await this.apartmentRepo.findOne({
      where: { id: apartmentId },
    });

    if (!apartment) throw new Error('Apartment not found');

    const favoriteApartment = this.favoriteApartmentRepo.create({
      favorite,
      apartment,
    });
    return await this.favoriteApartmentRepo.save(favoriteApartment);
  }

  async removeApartmentFromFavoriteList(
    apartmentId: string,
    studentId: string,
  ) {
    const favoriteApartment = await this.favoriteApartmentRepo
      .createQueryBuilder('fa')
      .leftJoinAndSelect('fa.favorite', 'favorite')
      .where('favorite.studentId = :studentId', { studentId })
      .andWhere('fa.apartmentId = :apartmentId', { apartmentId })
      .getOne();

    if (!favoriteApartment)
      throw new Error('Apartment not found in favorite list');

    return await this.favoriteApartmentRepo.remove(favoriteApartment);
  }

  async getApartmentsForFavoriteList(
    favoriteId: string,
    pagination: { limit: number; page: number },
  ) {
    return await this.favoriteApartmentRepo.find({
      where: { favorite: { id: favoriteId } },
      take: pagination.limit,
      skip: (pagination.page - 1) * pagination.limit,
      relations: ['apartment'],
    });
  }

  async getApartmentsCount(favoriteId: string) {
    return await this.favoriteApartmentRepo.count({
      where: { favorite: { id: favoriteId } },
    });
  }

  async addedToFavoriteList(apartmentId: string, studentId: string) {
    const favoriteApartment = await this.favoriteApartmentRepo
      .createQueryBuilder('fa')
      .leftJoinAndSelect('fa.favorite', 'favorite')
      .where('favorite.studentId = :studentId', { studentId })
      .andWhere('fa.apartmentId = :apartmentId', { apartmentId })
      .getOne();

    return !!favoriteApartment;
  }
}
