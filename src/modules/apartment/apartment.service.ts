import { Injectable, NotFoundException } from '@nestjs/common';
import { Apartment } from './entities/apartment.entity/apartment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ApartmentService {
    constructor(
        @InjectRepository(Apartment)
        private readonly apartmentRepository: Repository<Apartment>,
    ) { }

    async getById(id: string) {
        const apartment = await this.apartmentRepository.findOneBy({ id });
        if (!apartment) {
            throw new NotFoundException('apartment not found');
        }
        return apartment
    }

      async updateApartmentApproval(id: string, isTrusted: boolean): Promise<Apartment> {
        const apartment = await this.apartmentRepository.findOneBy({ id });
        if (!apartment) {
          throw new NotFoundException(`apartment not found`);
        }
        apartment.isTrusted = isTrusted;
        return this.apartmentRepository.save(apartment);
      }
    
      async getUnReviewedApartments(): Promise<Apartment[]> {
        return this.apartmentRepository.find({
          where: {
            isReviewed: false
          },
        });
      }

}
