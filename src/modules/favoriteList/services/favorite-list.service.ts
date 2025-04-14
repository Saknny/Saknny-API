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
    studentId: string,
  ) {
    
    let favorite = await this.favoriteRepo
    .createQueryBuilder('favorite')
    .leftJoinAndSelect('favorite.student', 'student') // Join the student relation
    .where('student.id = :studentId', { studentId })   // Filter by student ID
    .andWhere('favorite.name = :name', { name: 'My Favorites' }) // Filter by list name
    .getOne(); // Get single res
    console.log(favorite)
    if (!favorite) {
      favorite = this.favoriteRepo.create({
        name: 'My Favorites',
        student: { id: studentId },
      });
      await this.favoriteRepo.save(favorite);
    }
    // 2. Get full apartment entity using QueryBuilder
    const apartment = await this.apartmentRepo
      .createQueryBuilder('apartment')
      .where('apartment.id = :apartmentId', { apartmentId })
      .getOne();
    // Prevent duplicates
    const existing = await this.favoriteApartmentRepo
  .createQueryBuilder('fa')
  .leftJoinAndSelect('fa.favorite', 'favorite')
  .leftJoinAndSelect('fa.apartment', 'apartment')
  .where('favorite.id = :favoriteId', { favoriteId: favorite.id })
  .andWhere('apartment.id = :apartmentId', { apartmentId })
  .getOne();
    if (existing) throw new Error('Apartment already in favorites');
    
    const favoriteApartment = this.favoriteApartmentRepo.create({
      favorite,
      apartment,
    });
    await this.favoriteApartmentRepo.save(favoriteApartment);
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

    await this.favoriteApartmentRepo.remove(favoriteApartment);
  }

  async getApartmentsForFavoriteList(
    studentId: string, // Now accepts studentId instead of favoriteId
  pagination: { limit: number; page: number },
) {
  // 1. Find "My Favorites" list for this student
  const favorite = await this.favoriteRepo
    .createQueryBuilder('favorite')
    .leftJoinAndSelect('favorite.student', 'student')
    .where('student.id = :studentId', { studentId })
    .andWhere('favorite.name = :name', { name: 'My Favorites' })
    .getOne();

  if (!favorite) {
    return {}; // Return empty array if no list exists
  }

  // 2. Get apartments using QueryBuilder
  const favoriteApartments = await this.favoriteApartmentRepo
    .createQueryBuilder('fa')
    .leftJoinAndSelect('fa.apartment', 'apartment')
    .where('fa.favoriteId = :favoriteId', { favoriteId: favorite.id })
    .take(pagination.limit)
    .skip((pagination.page - 1) * pagination.limit)
    .getMany();
     // 3. Extract apartment IDs from favorite entries
  const favoriteApartmentIds = favoriteApartments.map(fa => fa.apartment.id);

  // 4. Create the markFavorite function
  const markFavorite = (apartments: Apartment[]) => 
    apartments.map(apartment => ({
      ...apartment,
      isFavorite: favoriteApartmentIds.includes(apartment.id)
    }));

  // 5. Apply to the results
  const apartments = favoriteApartments.map(fa => fa.apartment);
  
  return {
    favorites:markFavorite(apartments)
  }
  
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
