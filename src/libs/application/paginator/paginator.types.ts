export interface PaginationRes<T> {
  items: T[];
  pageInfo: {
    page?: number;
    limit?: number;
    nextCursor?: string;
    beforeCursor?: string;
    totalCount?: number;
    hasNext: boolean;
    hasBefore: boolean;
    direction?: CursorBasedPaginationDirection;
  };
}

export enum CursorBasedPaginationDirection {
  BEFORE = 'BEFORE',
  AFTER = 'AFTER',
}

export enum CursorBasedSortType {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum SortTypeEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

export abstract class PageInfo {
  @Expose()
  page?: number;

  @Expose()
  limit?: number;

  @Expose()
  nextCursor?: string;

  @Expose()
  beforeCursor?: string;

  @Expose()
  hasNext: boolean;

  @Expose()
  hasBefore: boolean;

  @Expose()
  totalCount?: number;

  @Expose()
  direction?: CursorBasedPaginationDirection;
}

import { Expose } from 'class-transformer';
import { SelectQueryBuilder, WhereExpressionBuilder, Brackets } from 'typeorm';

const DELIMITER = '|';

type Query<T> = SelectQueryBuilder<T>;

type Direction = 'ASC' | 'DESC';

export type Order = Record<string, Direction>;

export type PageOptions = {
  first?: number;
  last?: number;
  after?: string;
  before?: string;
};

type PageMeta<T> = {
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
  paginator: CursorPaginator<T>;
};

export type ValidatePageOptions<O extends PageOptions> = O extends {
  first: number;
  last: number;
}
  ? never
  : O extends { first: number; after?: string; before?: string }
    ? O
    : O extends { last: number; after?: string; before?: string }
      ? O
      : never;

type Row = Record<string, Date | string | number | object>;

class Edge<T> {
  constructor(
    public readonly node: T,
    protected options: { row: Row; paginator: CursorPaginator<T> },
  ) {}

  get cursor() {
    return this.options.paginator.cursor(this.options.row);
  }
}

export class Page<T> {
  constructor(
    protected result: { entities: T[]; raw: Row[] },
    protected meta: PageMeta<T>,
  ) {}

  get edges(): Edge<T>[] {
    const { pageSize, paginator } = this.meta;
    const entities = this.result.entities.slice(0, pageSize);
    return entities.map((entity, index) => {
      const row = this.result.raw[index];
      return new Edge(entity, { row, paginator });
    });
  }

  get pageInfo() {
    return {
      totalCount: () => this.getTotalCount(),
      hasNextPage: this.meta.hasNext,
      hasPreviousPage: this.meta.hasPrevious,
      startCursor: this.startCursor,
      endCursor: this.endCursor,
    };
  }

  protected getTotalCount() {
    return this.meta.paginator.count();
  }

  protected get startCursor(): string | undefined {
    const firstItem = this.edges[0];
    return firstItem?.cursor;
  }

  protected get endCursor(): string | undefined {
    const [lastItem] = this.edges.slice(-1);
    return lastItem?.cursor;
  }
}

export class DailyCursuredData<T> {
  dayTimeStamp: number;
  data: T[];
}

export class CursorPaginator<T> {
  protected query: Query<T>;
  protected order: Order;
  protected virtual: Record<string, string | undefined>;
  private readonly _encoding = 'base64';

  constructor(
    query: Query<T>,
    order: Order = {},
    virtual: Record<string, string> = {},
  ) {
    query = query.clone();
    this.virtual = virtual;
    this.order = this.buildOrdering(query, order);
    this.query = this.applyOrdering(query);
  }

  async page<O extends PageOptions>({
    first,
    last,
    after,
    before,
  }: ValidatePageOptions<O>): Promise<Page<T>> {
    const pageSize = (first ?? last) as number;
    const query = this.query.clone();
    if (last) this.reverseOrdering(query);
    if (after) this.applyCursor(query, after);
    if (before) this.applyCursor(query, before, true);
    const result = await query.limit(pageSize + 1).getRawAndEntities();
    const hasNextAndPrevious = this.getHasNextAndPrevious(
      result,
      pageSize,
      first,
      after,
      before,
    );

    return new Page(result, {
      pageSize,
      paginator: this,
      ...hasNextAndPrevious,
    });
  }

  private getHasNextAndPrevious(
    result: { entities: T[]; raw: any[] },
    pageSize: number,
    first: number | undefined,
    after: string | undefined,
    before: string | undefined,
  ) {
    const hasMore = result.raw.length > pageSize;
    const showingFirstPage = first !== undefined;
    return showingFirstPage
      ? { hasNext: hasMore, hasPrevious: !!after }
      : { hasNext: !!before, hasPrevious: hasMore };
  }

  cursor(row: Row): string {
    return this.encodeCursor(this.getPosition(row));
  }

  count(): Promise<number> {
    return this.query.getCount();
  }

  protected applyOrdering(query: Query<T>, order = this.order): Query<T> {
    const columns = Array.from(Object.entries(order));
    columns.forEach(([column, direction], index) => {
      const expression = this.getColumnExpression(query, column);
      if (this.isVirtual(column)) {
        query.addSelect(expression, column);
      }

      if (index === 0) {
        query.orderBy(expression, direction);
      } else {
        query.addOrderBy(expression, direction);
      }
    });

    return query;
  }

  protected reverseOrdering(query: Query<T>): Query<T> {
    const order: Order = {};
    Object.entries(this.order).forEach(([column, direction]) => {
      order[column] = direction === 'ASC' ? 'DESC' : 'ASC';
    });

    return this.applyOrdering(query, order);
  }

  protected applyCursor(
    query: Query<T>,
    cursor: string,
    isBefore = false,
  ): void {
    const columns = Object.keys(this.order);
    const position = this.decodeCursor(cursor);
    query.andWhere(
      new Brackets((where) =>
        this.applyWhere(query, where, {
          columns,
          position,
          index: 0,
          isBefore,
        }),
      ),
    );
  }

  protected applyWhere(
    query: Query<T>,
    where: WhereExpressionBuilder,
    {
      columns,
      position,
      index,
      isBefore,
    }: {
      columns: string[];
      position: unknown[];
      index: number;
      isBefore: boolean;
    },
  ): void {
    const column = columns[index];
    const expression = this.getColumnExpression(query, column);
    const isReversed = this.order[column] === 'DESC';
    const isDiscriminant = index >= columns.length - 1;

    const comparator = isBefore !== isReversed ? '<' : '>';
    const parameter = isBefore ? `_before_${index}` : `_after_${index}`;
    const totalOrder = `${expression} ${comparator} :${parameter}`;
    const partialOrder = `${expression} ${comparator}= :${parameter}`;
    query.setParameter(parameter, position[index]);

    if (isDiscriminant) {
      where.where(totalOrder);
    } else {
      where.where(partialOrder).andWhere(
        new Brackets((andWhere) =>
          andWhere.where(totalOrder).orWhere(
            new Brackets((orWhere) =>
              this.applyWhere(query, orWhere, {
                columns,
                position,
                index: index + 1,
                isBefore,
              }),
            ),
          ),
        ),
      );
    }
  }

  protected escapeColumn(query: Query<T>, column: string) {
    return column
      .replace('"', '')
      .split('.')
      .map(query.connection.driver.escape)
      .join('.');
  }

  protected isVirtual(property: string) {
    return !!this.virtual[property];
  }

  protected getColumnExpression(query: Query<T>, column: string) {
    return this.virtual[column] ?? this.escapeColumn(query, column);
  }

  protected buildOrdering(query: Query<T>, order: Order): Order {
    const baseOrder: Order = { ...order, id: 'ASC' };
    const builtOrder: Order = {};
    for (const property in baseOrder) {
      const direction = baseOrder[property];

      const isAliased = property.includes('.');
      const isVirtual = this.isVirtual(property);
      if (isAliased || isVirtual) {
        builtOrder[property] = direction;
        continue;
      }

      const alias = query.expressionMap.mainAlias;
      const meta = alias?.metadata?.findColumnWithPropertyName(property);
      const column = meta?.databaseName || property;

      builtOrder[`${alias?.name}.${column}`] = direction;
    }

    return builtOrder;
  }

  protected decodeCursor(cursor: string) {
    const value = Buffer.from(cursor, this._encoding).toString();
    return value.split(DELIMITER).map((value) => JSON.parse(value));
  }

  protected encodeCursor(position: string[]) {
    const value = position.join(DELIMITER);
    return Buffer.from(value).toString(this._encoding);
  }

  protected getPosition(row: Row) {
    return Object.keys(this.order).map((column) => {
      const property = column.replace('.', '_');

      return JSON.stringify(row[property] || null);
    });
  }
}
