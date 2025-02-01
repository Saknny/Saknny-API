import {
  Repository,
  FindOptionsOrder,
  FindOptionsSelect,
  FindOptionsSelectByString,
  FindOptionsWhere,
  FindOptionsRelationByString,
  FindOptionsRelations,
  DeepPartial,
  ObjectLiteral,
  IsNull,
  In,
  MoreThan,
  LessThan,
  Not,
  Timestamp,
} from 'typeorm';
import { PaginationRes } from '../application/paginator/paginator.types';
import { BaseHttpException } from '../application/exceptions/base-http-exception';
import { ErrorCodeEnum } from '../application/exceptions/error-code.enum';
import { HttpException } from '@nestjs/common';

export class BaseRepository<T extends ObjectLiteral> extends Repository<T> {
  //@ts-ignore
  async findOne(
    where: FindOptionsWhere<T>[] | WhereOptions<T> = {},
    include: FindOptionsRelations<T> | FindOptionsRelationByString = [],
    attributes?: FindOptionsSelect<T> | FindOptionsSelectByString<T>,
    sort?: FindOptionsOrder<T>,
  ) {
    return super.findOne({
      where: this.changeOptions(where),
      relations: include,
      select: attributes,
      order: sort,
    });
  }

  async findOneOrError(
    where: FindOptionsWhere<T>[] | WhereOptions<T> = {},
    errorCode?: ErrorCodeEnum,
    include: FindOptionsRelations<T> | FindOptionsRelationByString = [],
    attributes?: FindOptionsSelect<T> | FindOptionsSelectByString<T>,
  ): Promise<T> {
    const result = await this.findOne(
      this.changeOptions(where),
      include,
      attributes,
    );
    if (!result)
      throw new BaseHttpException(errorCode || ErrorCodeEnum.NOT_FOUND);
    return result;
  }

  async findOneWithError(
    where: FindOptionsWhere<T>[] | WhereOptions<T> = {},
    errorCode?: ErrorCodeEnum,
    include: FindOptionsRelations<T> | FindOptionsRelationByString = [],
    attributes: FindOptionsSelect<T> | FindOptionsSelectByString<T> = {},
    returnAll: boolean = false,
    customIdField: keyof T = 'id',
  ) {
    const result = await this.findOne(
      this.changeOptions(where),
      include,
      !returnAll
        ? ({ [customIdField]: true, ...attributes } as any)
        : undefined,
    );
    if (result)
      throw new BaseHttpException(errorCode || ErrorCodeEnum.NOT_ALLOWED);
    return result;
  }

  async findAllIdsOrError(
    ids: string[],
    where?: WhereOptions<T>,
    errorCode?: ErrorCodeEnum,
    customIdField: keyof T = 'id',
    include: FindOptionsRelations<T> | FindOptionsRelationByString = [],
  ) {
    const result = await this.find({
      where: this.changeOptions({
        [customIdField]: In(ids),
        ...where,
      } as WhereOptions<T>),
      relations: include,
    });
    if (result.length !== ids.length)
      throw new BaseHttpException(errorCode || ErrorCodeEnum.NOT_FOUND);
    return result;
  }

  async findAllExistsAndNotIds(
    ids: string[],
    customIdField: keyof T = 'id',
    include: FindOptionsRelations<T> | FindOptionsRelationByString = [],
  ) {
    const [result, total] = await this.findAndCount({
      where: { [customIdField]: In(ids) } as FindOptionsWhere<T>,
      relations: include,
    });
    const notExistingIds = ids.filter(
      (id) => !result.map((item) => item[customIdField]).includes(id as any),
    );
    return { exists: result, notExistingIds };
  }

  async findAll(
    where: FindOptionsWhere<T>[] | WhereOptions<T> = {},
    include: FindOptionsRelations<T> | FindOptionsRelationByString = [],
    sort?: FindOptionsOrder<T>,
    attributes?: FindOptionsSelect<T> | FindOptionsSelectByString<T>,
    limit?: number,
    skip?: number,
  ): Promise<T[]> {
    return this.find({
      where: this.changeOptions(where),
      relations: include,
      order: sort,
      select: attributes,
      take: limit,
      skip,
    });
  }

  async findPaginated(
    where: FindOptionsWhere<T>[] | WhereOptions<T> = {},
    sort?: FindOptionsOrder<T>,
    page: number = 1,
    limit: number = 15,
    include: FindOptionsRelations<T> | FindOptionsRelationByString = [],
  ): Promise<PaginationRes<T>> {
    const skip = (page - 1) * limit;
    const [result, total] = await this.findAndCount({
      where: this.changeOptions(where),
      relations: include,
      order: sort,
      take: limit,
      skip,
    });

    return {
      items: result,
      pageInfo: {
        page,
        limit,
        hasBefore: page > 1,
        hasNext: skip + limit < total,
        totalCount: total,
      },
    };
  }

  findPaginatedManually(
    items: T[],
    page: number = 1,
    limit: number = 15,
  ): PaginationRes<T> {
    const skip = page * limit;
    const slicedItems = items.slice(skip, skip + limit);

    return {
      items: slicedItems,
      pageInfo: {
        page,
        hasBefore: page > 1,
        hasNext: slicedItems.length === limit && page * limit < items.length,
      },
    };
  }

  softDeleteWithUpdate(
    where: FindOptionsWhere<T>[] | WhereOptions<T> = {},
    input: DeepPartial<T>,
  ): Promise<T[]> {
    return this.updateAll(where, { ...input, deletedAt: new Date() });
  }

  async sumField(
    field: keyof T,
    where: FindOptionsWhere<T>[] | WhereOptions<T> = {},
  ): Promise<number> {
    const result = await this.createQueryBuilder()
      .select(`SUM(${String(field)})`, 'sum')
      .where(this.changeOptions(where))
      .getRawOne();

    return parseInt(result.sum) || 0;
  }

  async createOne(input: DeepPartial<T>): Promise<T> {
    const entity = this.create(input);
    return await this.save(entity);
  }

  async createOneOrUpdate<K extends keyof DeepPartial<T>>(
    input: DeepPartial<T> | ((item: T) => DeepPartial<T>),
    where: FindOptionsWhere<T>[] | WhereOptions<T> = {},
    primaryKey: K = 'id' as K,
  ): Promise<T> {
    let finalInput: DeepPartial<T>;
    if (typeof input === 'function') {
      finalInput = input({} as T);
    } else {
      finalInput = input;
    }
    const item = await this.findOne(
      this.changeOptions({
        ...where,
        ...(finalInput[primaryKey] && { [primaryKey]: finalInput[primaryKey] }),
      }),
    );

    if (item) {
      let updateInput: DeepPartial<T>;
      if (typeof input === 'function') {
        updateInput = input(item);
      } else {
        updateInput = input;
      }

      return await this.updateOneFromExistingModel(item, updateInput);
    } else {
      return await this.createOne(finalInput);
    }
  }

  async bulkCreate(models: DeepPartial<T>[]): Promise<T[]> {
    const entities = this.create(models);
    return this.save(entities);
  }

  async findOrCreate(
    where: FindOptionsWhere<T>[] | WhereOptions<T> = {},
    input?: DeepPartial<T>,
  ): Promise<T> {
    let item = await this.findOne(this.changeOptions(where));
    if (!item) item = await this.createOne({ ...where, ...input });
    return item;
  }

  async updateOneFromExistingModel(
    model: T,
    input: DeepPartial<T>,
  ): Promise<T> {
    Object.assign(model, input);

    return await this.save(model);
  }

  async updateAll(
    where: FindOptionsWhere<T>[] | WhereOptions<T> = {},
    input: DeepPartial<T>,
  ): Promise<T[]> {
    const models = await this.find({ where: this.changeOptions(where) });
    models.forEach((model) => Object.assign(model, input));
    return this.save(models);
  }

  async deleteAll(where: WhereOptions<T>): Promise<number> {
    const result = await this.delete(
      this.changeOptions(where) as WhereOptions<T>,
    );
    return result.affected || 0;
  }

  async truncateModel(): Promise<void> {
    await this.query(`DELETE FROM ${this.metadata.tableName}`);
  }

  async rawDelete(): Promise<void> {
    await this.query(`DELETE FROM ${this.metadata.tableName}`);
  }

  async rawQuery<T>(sql: string): Promise<T> {
    const result = await this.query(sql);
    return result[0];
  }

  private changeOptions(
    options: FindOptionsWhere<T>[] | WhereOptions<T>,
  ): FindOptionsWhere<T>[] | FindOptionsWhere<T> {
    if (Array.isArray(options)) {
      return options.map((obj) =>
        Object.fromEntries(
          Object.entries(obj).map(([k, v]) => [k, v !== null ? v : IsNull()]),
        ),
      ) as FindOptionsWhere<T>[];
    } else {
      const { $or, ...common } = options;
      if (!$or) {
        return Object.fromEntries(
          Object.entries(options).map(([k, v]) => [
            k,
            v !== null ? v : IsNull(),
          ]),
        ) as FindOptionsWhere<T> | FindOptionsWhere<T>[];
      } else {
        const final = $or.map((obj) => ({ ...obj, ...common }));
        return this.changeOptions(final) as FindOptionsWhere<T>[];
      }
    }
  }

  async findCursorPaginated(
    where: FindOptionsWhere<T>[] | WhereOptions<T> = {},
    cursor?: string | Date | number | Timestamp,
    direction: 'AFTER' | 'BEFORE' = 'AFTER',
    limit: number = 15,
    sort: 'ASC' | 'DESC' = 'DESC',
    paginationKey: keyof T = 'createdAt',
    keyType: 'DATE' | 'NUMBER' = 'DATE',
    include: FindOptionsRelations<T> | FindOptionsRelationByString = [],
    initialShift: number = 0,
  ): Promise<PaginationRes<T>> {
    const shifting = cursor ? 0 : initialShift;
    const cursorValue = this.getCursorValue(keyType, cursor);

    try {
      const [totalCount, result, beforeItems] = await Promise.all([
        this.getTotalCount(where),
        this.fetchPaginatedData(
          where,
          cursorValue,
          direction,
          paginationKey,
          sort,
          limit,
          include,
        ),
        this.fetchBeforeItems(
          where,
          cursorValue,
          direction,
          paginationKey,
          sort,
          shifting,
          limit,
        ),
      ]);

      return this.buildPaginationResult(
        result,
        beforeItems,
        limit,
        paginationKey,
        totalCount,
        shifting,
      );
    } catch {
      throw new HttpException(
        'Error in findCursorPaginated',
        ErrorCodeEnum.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getCursorValue(
    keyType: 'DATE' | 'NUMBER',
    cursor?: string | Date | number | Timestamp,
  ): Date | number | undefined {
    if (!cursor) return undefined;
    return keyType === 'DATE'
      ? new Date(isNaN(+cursor) ? String(cursor) : +cursor)
      : +cursor;
  }

  private async getTotalCount(
    where: FindOptionsWhere<T>[] | WhereOptions<T>,
  ): Promise<number> {
    return this.count({ where: this.changeOptions(where) });
  }

  private async fetchPaginatedData(
    where: FindOptionsWhere<T>[] | WhereOptions<T>,
    cursorValue: Date | number | undefined,
    direction: 'AFTER' | 'BEFORE',
    paginationKey: keyof T,
    sort: 'ASC' | 'DESC',
    limit: number,
    include: FindOptionsRelations<T> | FindOptionsRelationByString,
  ): Promise<T[]> {
    const cursorCondition = cursorValue
      ? {
          [paginationKey]:
            direction !== 'AFTER'
              ? Not(LessThan(cursorValue))
              : Not(MoreThan(cursorValue)),
        }
      : {};

    return this.findAll(
      { ...this.changeOptions(where), ...cursorCondition },
      include,
      // @ts-ignore
      { [paginationKey]: sort },
      undefined,
      limit + 1,
    );
  }

  private async fetchBeforeItems(
    where: FindOptionsWhere<T>[] | WhereOptions<T>,
    cursorValue: Date | number | undefined,
    direction: 'AFTER' | 'BEFORE',
    paginationKey: keyof T,
    sort: 'ASC' | 'DESC',
    shifting: number,
    limit: number,
  ): Promise<T[]> {
    const cursorCondition = {
      [paginationKey]:
        direction === 'AFTER' ? MoreThan(cursorValue) : LessThan(cursorValue),
    };

    return this.findAll(
      { ...this.changeOptions(where), ...cursorCondition },
      undefined,
      // @ts-ignore
      { [paginationKey]: sort === 'ASC' ? 'DESC' : 'ASC' },
      undefined,
      limit,
    );
  }

  private buildPaginationResult(
    result: T[],
    beforeItems: T[],
    limit: number,
    paginationKey: keyof T,
    totalCount: number,
    shifting: number,
  ): PaginationRes<T> {
    const beforeItem = beforeItems[beforeItems.length - 1];
    const itemData = result.length > limit ? result.slice(0, -1) : result;
    const afterItem = result.length > limit ? result[limit] : undefined;

    const finalItems = shifting
      ? [...beforeItems, ...itemData].filter(Boolean)
      : itemData;

    return {
      items: finalItems,
      pageInfo: {
        limit,
        beforeCursor:
          beforeItem &&
          beforeItem[paginationKey] !== finalItems[0][paginationKey]
            ? String(new Date(beforeItem[paginationKey]).getTime())
            : undefined,
        nextCursor: afterItem
          ? String(new Date(afterItem[paginationKey]).getTime())
          : undefined,
        hasBefore: !!beforeItem,
        hasNext: !!afterItem,
        totalCount,
      },
    };
  }
}

export type WhereOptions<T> = FindOptionsWhere<T> & {
  $or?: FindOptionsWhere<T>[];
};
