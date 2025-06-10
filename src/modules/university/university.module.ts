import { Module } from '@nestjs/common';
import { UniversityService } from './university.service';
import { UniversityController } from './university.controller';
import { University } from './entities/university/university.entity';
import { Major } from './entities/major/major.entity';
import { Level } from './entities/level/level.entity';
import { DatabaseModule } from '@src/configs/database/database.module';

@Module({
  imports: [DatabaseModule.forFeature([University,Major,Level])],
  providers: [UniversityService],
  controllers: [UniversityController],
   exports:[UniversityService]
})
export class UniversityModule {}
