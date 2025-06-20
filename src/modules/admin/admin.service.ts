import { Injectable, NotFoundException } from "@nestjs/common";
import { Admin } from "./entities/admin.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, MoreThan, Not, Repository } from "typeorm";
import { Provider } from "../provider/entities/provider.entity";
import { Student } from "../student/entities/student.entity";
import { Apartment } from "../apartment/entities/apartment.entity/apartment.entity";
import { RentalRequest } from "../booking-request/entity/rental-request.entity";
import { BaseRepository } from "@src/libs/types/base-repository";
import { PendingRequest } from "../request/entities/pendingRequest.entity";
import { Review } from "../review/entities/review.entity";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(RentalRequest)
    private readonly bookingRepo: BaseRepository<RentalRequest>,
    @InjectRepository(Student)
    private readonly studentRepo: BaseRepository<Student>,
   @InjectRepository(Apartment)
    private readonly apartmentRepo: BaseRepository<Apartment>,
    @InjectRepository(Provider)
    private readonly providerRepo: BaseRepository<Provider>,
    @InjectRepository(PendingRequest)
    private readonly requestRepo: BaseRepository<PendingRequest>,
     @InjectRepository(Review)
    private readonly reviewRepo: BaseRepository<Review>
  ) {}

  async getDashboardData() {
    const [totalBookings, activeStudents, availableRooms, newListings, totalProviders] = await Promise.all([
      this.bookingRepo.count(), // ✅ Total Bookings
      this.studentRepo.count(), // ✅ Total students 
      this.apartmentRepo.count(), // ✅ Available Rooms
      this.apartmentRepo.count({ where: { createdAt: MoreThan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) } }), // ✅ New Listings in last 30 days
      this.providerRepo.count(), // ✅ Total Providers
    ]);

    // Request status distribution
    const requestStatusCounts = await this.requestRepo
      .createQueryBuilder('request')
      .select('request.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('request.status')
      .getRawMany();

    const requestDistribution = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    for (const row of requestStatusCounts) {
      requestDistribution[row.status.toLowerCase()] = +row.count;
    }

    // Monthly bookings
    const monthlyBookings = await this.bookingRepo
      .createQueryBuilder('booking')
      .select(`TO_CHAR(booking.createdAt, 'Mon')`, 'month')
      .addSelect('COUNT(*)', 'count')
      .groupBy('month')
      .orderBy('MIN(booking.createdAt)')
      .getRawMany();

    // Bookings by Location
    const bookingsByLocation = await this.bookingRepo
    .createQueryBuilder('booking')
    .leftJoin('booking.bed', 'bed')
    .leftJoin('bed.room', 'room')
    .leftJoin('room.apartment', 'apartment')
    .select('apartment.locationEnum', 'locationEnum')
    .addSelect('COUNT(*)', 'count')
    .groupBy('apartment.locationEnum')
    .getRawMany();
   // rating breakdown 
    const ratingBreakdown = await this.reviewRepo
    .createQueryBuilder('review')
    .select('review.rating', 'stars')
    .addSelect('COUNT(*)', 'count')
    .groupBy('review.rating')
    .orderBy('review.rating', 'DESC')
    .getRawMany();



    

    return {
      totalBookings,
      activeStudents,
      availableRooms,
      newListings,
      totalProviders,
      requestDistribution,
      monthlyBookings,
      bookingsByLocation,
      ratingBreakdown

    };
  }
}
