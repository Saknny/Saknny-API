import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from '@src/configs/database/database.module';
import { Apartment } from '../apartment/entities/apartment.entity/apartment.entity';
import { Student } from '../student/entities/student.entity';
import { Report } from './entities/report.entity';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';

@Module({
  imports: [DatabaseModule.forFeature([Report,Apartment,Student])],
  providers: [ReportService],
  controllers: [ReportController],
  exports: [ReportService]
})
export class ReportModule { }

