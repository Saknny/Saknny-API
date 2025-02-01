import { Module } from '@nestjs/common';
import { IndividualService } from './individual.service';
import { IndividualController } from './individual.controller';
import { DatabaseModule } from '../../configs/database/database.module';
import { Individual } from './entities/individual.entity';
import { IndividualTransformer } from './transformer/individual.transformer';
import { Model } from './entities/specialties/model.entity';
import { Editor } from './entities/specialties/editor.entity';
import { Videographer } from './entities/specialties/videographer.entity';
import { Photographer } from './entities/specialties/photographer.entity';

@Module({
  imports: [
    DatabaseModule.forFeature([
      Individual,
      Model,
      Editor,
      Videographer,
      Photographer,
    ]),
  ],
  controllers: [IndividualController],
  providers: [IndividualService, IndividualTransformer],
  exports: [IndividualService, IndividualTransformer],
})
export class IndividualModule {}
