import { InjectBaseRepository } from '@libs/decorators/inject-base-repository.decorator';
import { BaseRepository } from '@libs/types/base-repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Student } from './entities/student.entity';
import { CompleteProfileDto } from './dtos/CompleteProfileDto.dto';
import { UpdateStudentInput } from './dtos/inputs/update-student.input';
import { ErrorCodeEnum } from '@src/libs/application/exceptions/error-code.enum';
import { Status } from '../request/entities/enum/status.enum';

@Injectable()
export class StudentService {
  constructor(
    @InjectBaseRepository(Student)
    private readonly studentRepo: BaseRepository<Student>,
  ) { }
  async getById(id: string) {
    const student = await this.studentRepo.findOneBy({ id });
    if (!student) {
      throw new NotFoundException('student not found');
    }

    await this.studentRepo.save(student);
    return student;
  }

  async completeProfile(
    userId: string,
    completeProfileDto: CompleteProfileDto,
  ): Promise<Student> {
    const student = await this.studentRepo.findOne({ userId });

    if (!student) {
      throw new Error('Student not found');
    }
    student.status = Status.APPROVED;
    if (completeProfileDto.idCard) {
      student.idCard = completeProfileDto.idCard;
    }

    if (completeProfileDto.image) {
      student.image = completeProfileDto.image;
    }

    student.major = completeProfileDto.major;
    student.smoking = completeProfileDto.smoking;
    student.level = completeProfileDto.level;
    student.socialPerson = completeProfileDto.socialPerson;
    student.hobbies = completeProfileDto.hobbies;
    student.instagram = completeProfileDto.instagram;
    student.facebook = completeProfileDto.facebook;
    student.linkedin = completeProfileDto.linkedin;
    student.phone = completeProfileDto.phone;
    student.university = completeProfileDto.university;
    student.gender=completeProfileDto.gender;

    return this.studentRepo.save(student);
  }

  async updateStudent(userId: string, attrs: Partial<Student>) {
    const student = await this.studentRepo.findOne({ userId });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (attrs.facebook) {
      student.facebook = attrs.facebook;
    }
    if (attrs.instagram) {
      student.instagram = attrs.instagram;
    }
    if (attrs.linkedin) {
      student.linkedin = attrs.linkedin;
    }
    if (attrs.idCard) {
      student.idCard = attrs.idCard;
    }
    if (attrs.image) {
      student.image = attrs.image;
    }
    if (attrs.gender) {
      student.gender = attrs.gender;
    }
    if (attrs.firstName) {
      student.firstName = attrs.firstName;
    }
    if (attrs.lastName) {
      student.lastName = attrs.lastName;
    }
    if (attrs.phone) {
      student.phone = attrs.phone;
    }
    if (attrs.major) {
      student.major = attrs.major;
    }
    if (attrs.hobbies) {
      student.hobbies = attrs.hobbies;
    }
    if (attrs.smoking) {
      student.smoking = attrs.smoking;
    }
    if (attrs.level) {
      student.level = attrs.level;
    }
    if (attrs.socialPerson) {
      student.socialPerson = attrs.socialPerson;
    }
    if (attrs.university) {
      student.university = attrs.university;
    }
    await this.studentRepo.save(student);

    return student;
  }

  async getStudent(id: string) {
    const student = await this.studentRepo.findOne(
      { id, status: Status.APPROVED },
      ['user'],
    );

    if (!student) {
      throw new NotFoundException('student not found');
    }

    return student;
  }

  async getStudentBoard(id: string) {
    const student = await this.studentRepo.findOne({ id }, ['user']);

    if (!student) {
      throw new NotFoundException('student not found');
    }

    return student;
  }

  async updateCard(userId: string, idCard: string) {
    const student = await this.studentRepo.findOneBy({ userId });
    if (!student) {
      throw new NotFoundException('student not found');
    }
    student.idCard = idCard;
    await this.studentRepo.save(student);

  }

  async getStudentProfile(userId: string) {
    const student = await this.studentRepo
      .createQueryBuilder('student') 
      .leftJoinAndSelect('student.user', 'user')  
      .leftJoinAndSelect('student.bed', 'bed')  
      .leftJoinAndSelect('student.favorites', 'favorites') 
      .leftJoinAndSelect('student.rentalRequests', 'rentalRequests') 
      .leftJoinAndSelect('student.reviews', 'reviews')  
      .leftJoinAndSelect('student.reports', 'reports')  
      .where('student.userId = :userId', { userId }) 
      .getOne();  

    if (!student) {
      throw new NotFoundException(`Student with ID ${userId} not found`);
    }

    
    const baseUrl ='http://45.88.223.182:4000';
    const studentDto = {
      ...student,  
      image: student.image ? baseUrl + student.image : null, 
    };

    return studentDto;
  }
}
