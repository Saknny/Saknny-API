import { EntityTarget } from 'typeorm';
import { Inject } from '@nestjs/common';

export function InjectBaseRepository(
  entity: EntityTarget<any> & { name: string },
): ParameterDecorator {
  const repositoryToken = `${entity.name}Repository`;

  return (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) => {
    Inject(repositoryToken)(target, propertyKey, parameterIndex);
  };
}
