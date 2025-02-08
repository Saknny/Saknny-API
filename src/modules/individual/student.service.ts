import { InjectBaseRepository } from '@libs/decorators/inject-base-repository.decorator';
import { BaseRepository } from '@libs/types/base-repository';
import { Injectable } from '@nestjs/common';
import { Student } from './entities/student.entity';
import { StudentTransformer } from './transformer/student.transformer';

@Injectable()
export class StudentService {
  constructor(
    @InjectBaseRepository(Student)
    private readonly studentRepo: BaseRepository<Student>,
    private studentTransformer: StudentTransformer,
  ) {}
}
