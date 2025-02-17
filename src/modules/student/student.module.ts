import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../configs/database/database.module';
import { Student } from './entities/student.entity';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { StudentTransformer } from './transformer/student.transformer';

@Module({
  imports: [DatabaseModule.forFeature([Student])],
  controllers: [StudentController],
  providers: [StudentService, StudentTransformer],
  exports: [StudentService, StudentTransformer],
})
export class StudentModule {}
