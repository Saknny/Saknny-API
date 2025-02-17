import { InjectBaseRepository } from '@libs/decorators/inject-base-repository.decorator';
import { BaseRepository } from '@libs/types/base-repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Student } from './entities/student.entity';
import { CompleteProfileDto } from './dtos/CompleteProfileDto.dto';
import { UpdateStudentInput } from './dtos/inputs/update-student.input';


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
    student.isReviewed = true;
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
    student.isReviewed = false;
    student.isTrusted = false;
    return this.studentRepo.save(student);
  }

  async updateStudent(
    userId: string,
    attrs: Partial<Student>
  ) {

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
      student.isReviewed = false;
      student.isTrusted = false;
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

  async getUnReviewedStudents(): Promise<Student[]> {
    return this.studentRepo.find({
      where: {
        isReviewed: false
      },
    });
  }

  async updateStudentApproval(id: string, isTrusted: boolean): Promise<Student> {
    const student = await this.studentRepo.findOneBy({ id });
    if (!student) {
      throw new NotFoundException(`student not found`);
    }
    student.isTrusted = isTrusted;
    return this.studentRepo.save(student);
  }

}
