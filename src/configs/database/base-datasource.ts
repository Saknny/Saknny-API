import { BaseRepository } from '@src/libs/types/base-repository';
import { DataSource, DataSourceOptions, EntityTarget } from 'typeorm';
import { dataSource } from './postgres.config';

export class BaseDataSource extends DataSource {
  constructor(options: DataSourceOptions) {
    super(options);

    return new Proxy(this, {
      get(target, prop) {
        if (prop === 'constructor') {
          return { name: 'DataSource' };
        }
        return Reflect.get(target, prop);
      },
    });
  }
  protected baseRepositories = new Map<
    EntityTarget<any>,
    BaseRepository<any>
  >();
  getBaseRepository<Entity>(
    target: EntityTarget<Entity>,
  ): BaseRepository<Entity> {
    let repository = this.baseRepositories.get(target);
    if (repository) return repository;
    else {
      repository = new BaseRepository(target, dataSource.manager);
      this.baseRepositories.set(target, repository);
    }

    return new BaseRepository(target, this.manager, this.manager.queryRunner);
  }
}
