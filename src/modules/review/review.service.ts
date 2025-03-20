import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '@src/libs/types/base-repository';
import { Review } from './entities/review.entity';
import { AddReviewDto } from './dtos/addReview.dto';
import { Apartment } from '../apartment/entities/apartment.entity/apartment.entity';
import { Student } from '../student/entities/student.entity';
import { ApartmentReviewsDto } from './dtos/apartmentReviews.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: BaseRepository<Review>,
    @InjectRepository(Apartment)
    private readonly apartmentRepo: BaseRepository<Apartment>,
    @InjectRepository(Student)
    private readonly studentRepo: BaseRepository<Student>
  ) { }

    
  async getApartmentReviews(dto :ApartmentReviewsDto){
    const apartment = await this.apartmentRepo
      .createQueryBuilder('apartment')
      .select(['apartment.id', 'apartment.averageRating'])
      .where('apartment.id = :apartmentId', { apartmentId:dto.apartmentId })
      .getOne();

    if (!apartment) {
      throw new NotFoundException('Apartment not found');
    }

    // Fetch all reviews along with student details using QueryBuilder
    const reviews = await this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.student', 'student') // Join student entity
      .select([
        'review.id',
        'review.comment',
        'review.rating',
        'review.createdAt'
      ])
      .where('review.apartmentId = :apartmentId', { apartmentId:dto.apartmentId })
      .orderBy('review.createdAt', 'DESC') // Sort by latest reviews first
      .getMany();

    // Return structured response
    return {
      apartment: {
        id: apartment.id,
        rating: apartment.averageRating
      },
      reviews: reviews.map(review => ({
        id: review.id,
        comment: review.comment,
        rating: review.rating,
        createdAt: review.createdAt,
      }))
    };
  
  }
  async createReview(studentId: string, dto: AddReviewDto) {
    const student = await this.studentRepo.findOneBy({ userId: studentId });
    const apartment = await this.apartmentRepo.findOneBy({ id: dto.apartmentId });

    if (!student || !apartment) {
      throw new NotFoundException('Student or apartment not found');
    }

    // Verify student has booked this apartment
    const hasBooking = await this.validateStudentBooking(studentId, dto.apartmentId);
    if (!hasBooking) {
      throw new ForbiddenException('You must book a bed to review this apartment');
    }

    const review = this.reviewRepo.create({
      ...dto,
      student,
      apartment
    });

    await this.reviewRepo.save(review);

    await this.updateApartmentRating(dto.apartmentId);

    return review;
  }

  async createReport(studentId: string, dto: AddReviewDto){
    const student = await this.studentRepo.findOneBy({ userId: studentId });
    const apartment = await this.apartmentRepo.findOneBy({ id: dto.apartmentId });

    if (!student || !apartment) {
      throw new NotFoundException('Student or apartment not found');
    }

    const report = this.reviewRepo.create({
        ...dto,
        student,
        apartment
      });
  
      await this.reviewRepo.save(report);
      const [reports, count] = await this.reviewRepo
        .createQueryBuilder('review')
        .where('review.apartmentId = :apartmentId', { apartmentId: dto.apartmentId })
        .andWhere('review.report = :isReported', { isReported: true }) // Fix boolean condition
        .getManyAndCount();

    console.log(count);

    await this.apartmentRepo.update(dto.apartmentId, {
      status:"BLOCKED"
    });
    return reports;
    
  }
  private async validateStudentBooking(studentId: string, apartmentId: string) {
    return true;
  }

  async updateApartmentRating(apartmentId: string) {
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .where('review.apartmentId = :apartmentId', { apartmentId })
      .getRawOne();

    await this.apartmentRepo.update(apartmentId, {
      averageRating: result.average || 0
    });
  }



}