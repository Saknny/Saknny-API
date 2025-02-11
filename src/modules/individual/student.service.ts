import { InjectBaseRepository } from '@libs/decorators/inject-base-repository.decorator';
import { BaseRepository } from '@libs/types/base-repository';
import { Injectable } from '@nestjs/common';
import { Student } from './entities/student.entity';
import { StudentTransformer } from './transformer/student.transformer';
import { CompleteProfileDto } from './dtos/CompleteProfileDto.dto';
@Injectable()
export class StudentService {
  constructor(
    @InjectBaseRepository(Student)
    private readonly studentRepo: BaseRepository<Student>,
    private studentTransformer: StudentTransformer,
  ) {}

  async completeProfile(
    userId: string,
    completeProfileDto: CompleteProfileDto,
    idCardImagePath?: string,
    profilePicturePath?: string,
  ): Promise<Student> {
    const student = await this.studentRepo.findOne({ userId } );

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
    student.instagram=completeProfileDto.instagram;
    student.facebook=completeProfileDto.facebook;
    student.linkedin=completeProfileDto.linkedin;

    return this.studentRepo.save(student);
  }
}
