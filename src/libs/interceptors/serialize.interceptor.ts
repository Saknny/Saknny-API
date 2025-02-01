import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

class SerializationInterceptor<T> implements NestInterceptor {
  constructor(
    private dto: ClassConstructor,
    private itemType: ClassConstructor,
  ) {}

  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      map((data: any) => {
        if (data.items && Array.isArray(data.items)) {
          data.items = data.items.map((item: any) =>
            plainToInstance(this.itemType, item, {
              excludeExtraneousValues: true,
              enableImplicitConversion: true,
            }),
          );
        }

        return Array.isArray(data.items)
          ? data
          : plainToInstance(this.dto, data, {
              excludeExtraneousValues: true,
              enableImplicitConversion: true,
            });
      }),
    );
  }
}
interface ClassConstructor {
  new (...args: any[]): {};
}

export function Serialize<T>(
  dto: ClassConstructor,
  itemType?: ClassConstructor,
) {
  return UseInterceptors(new SerializationInterceptor(dto, itemType));
}
