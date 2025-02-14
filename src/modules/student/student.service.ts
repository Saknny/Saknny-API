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
    return student;
  }

  async completeProfile(
    userId: string,
    completeProfileDto: CompleteProfileDto,
    idCardImagePath?: string,
    profilePicturePath?: string,
  ): Promise<Student> {
    const student = await this.studentRepo.findOne({ userId });

    if (!student) {
      throw new Error('Student not found');
    }

    if (idCardImagePath) {
      student.idCardImageUrl = idCardImagePath;
    }

    if (profilePicturePath) {
      student.profilePictureUrl = profilePicturePath;
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
    body: UpdateStudentInput,
    idCardImagePath?: string,
    profilePicturePath?: string
  ) {
    console.log("Received body:", body);
    const student = await this.studentRepo.findOne({ userId });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    Object.assign(student, body);

    if (idCardImagePath) {
      student.idCardImageUrl = idCardImagePath;
      student.isReviewed = false;
      student.isTrusted = false;
    }
    if (profilePicturePath) student.profilePictureUrl = profilePicturePath;

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
