import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '@src/libs/types/base-repository';
import { Apartment } from '../apartment/entities/apartment.entity/apartment.entity';
import { Student } from '../student/entities/student.entity';
import { AddReportDto } from './dtos/addReport.dto';
import { Report } from './entities/report.entity';
import { ApartmentReviewsDto } from '../review/dtos/apartmentReviews.dto';
import { Provider } from '../provider/entities/provider.entity';
import { User } from '../user/entities/user.entity';
import { ProfileCompleteEnum } from '../user/enums/profile-complete.enum';


@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepo: BaseRepository<Report>,
    @InjectRepository(Apartment)
    private readonly apartmentRepo: BaseRepository<Apartment>,
    @InjectRepository(Student)
    private readonly studentRepo: BaseRepository<Student>,
    @InjectRepository(Provider)
    private readonly providerRepo: BaseRepository<Provider>,
    @InjectRepository(User)
    private readonly userRepo: BaseRepository<User>
  ) { }

    
  async getApartmentReports(apartmentId:string){
    const apartment = await this.apartmentRepo
      .createQueryBuilder('apartment')
      .where('apartment.id = :apartmentId', { apartmentId:apartmentId })
      .getOne();

    if (!apartment) {
      throw new NotFoundException('Apartment not found');
    }

    // Fetch all reviews along with student details using QueryBuilder
    const reports = await this.reportRepo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.student', 'student') // Join student entity
      .select([
        'report.id',
        'report.comment',
        'report.createdAt'
      ])
      .where('report.apartmentId = :apartmentId', { apartmentId:apartmentId })
      .orderBy('report.createdAt', 'DESC') // Sort by latest reviews first
      .getMany();

    // Return structured response
    return {
      apartment: {
        id: apartment.id,
        rating: apartment.averageRating
      },
      reports: reports.map(report => ({
        id: report.id,
        comment: report.comment,
        createdAt: report.createdAt,
      }))
    };
  
  }
  

  async createReport(studentId: string, dto: AddReportDto){
    const student = await this.studentRepo.findOneBy({ userId: studentId });
     const apartment = await this.apartmentRepo
    .createQueryBuilder('apartment')
    .leftJoinAndSelect('apartment.provider', 'provider')
    .leftJoinAndSelect('provider.user', 'user') // Assuming relation exists
    .where('apartment.id = :id', { id: dto.apartmentId })
    .getOne();

    if (!student || !apartment) {
      throw new NotFoundException('Student or apartment not found');
    }

    const report = this.reportRepo.create({
        ...dto,
        student,
        apartment
      });
  
      await this.reportRepo.save(report);

      const [reports, count] = await this.reportRepo
        .createQueryBuilder('report')
        .where('report.apartmentId = :apartmentId', { apartmentId: dto.apartmentId })
        .getManyAndCount();

        console.log(count)
    if (count == 1){
      
        // Block the apartment
    await this.apartmentRepo
      .createQueryBuilder()
      .update()
      .set({ status: 'BLOCKED' })
      .where('id = :id', { id: dto.apartmentId })
      .execute();

    // Update provider's user profileComplete field to UNVERIFIED
    const providerUserId = apartment.provider?.user?.id;
    if (providerUserId) {
      await this.userRepo
        .createQueryBuilder()
        .update()
        .set({ profileComplete: ProfileCompleteEnum.UNVERIFIED })
        .where('id = :id', { id: providerUserId })
        .execute();
    }
    }

    return report;
    
  }
 
  async getReport(id:string){
    return this.reportRepo.findOneBy({id});
  }

  async unblockApartment(apartmentId:string){
            await this.apartmentRepo.update(apartmentId, {
            status:"APPROVED" // APPROVED / PUBLISHED 
        });
        await this.removeReportsOnApartment(apartmentId);
  }

async removeReportsOnApartment(apartmentId: string) {
  await this.reportRepo
    .createQueryBuilder()
    .delete()
    .from(Report) // use the correct entity class name
    .where("apartmentId = :apartmentId", { apartmentId })
    .execute();
}


  
  


}