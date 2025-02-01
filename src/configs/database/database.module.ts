import { dataSource } from './postgres.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, DynamicModule } from '@nestjs/common';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

@Module({})
export class DatabaseModule extends TypeOrmModule {
  static forFeature(entities?: EntityClassOrSchema[]): DynamicModule {
    const providers = entities.map((entity) => {
      return {
        provide: `${entity['name']}Repository`,
        useFactory: () => {
          return dataSource.getBaseRepository(entity);
        },
      };
    });

    return {
      module: DatabaseModule,
      providers: [...providers],
      exports: [...providers],
    };
  }
}
