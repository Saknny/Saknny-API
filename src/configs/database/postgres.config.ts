import '@libs/utils/dotenv';
import { get } from 'env-var';
import { join } from 'path';

import { BaseDataSource } from './base-datasource';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const databaseConfig: PostgresConnectionOptions = {
  type: 'postgres',
  host: get('DB_HOST').required().asString(),
  port: get('DB_PORT').asIntPositive(),
  username: get('DB_USERNAME').required().asString(),
  password: get('DB_PASSWORD').required().asString(),
  database: get('DB_NAME').required().asString(),
  entities: [join(__dirname, '..', '..', '**', '*.entity.{ts,js}')],
  synchronize: true,
  migrationsRun: false,
  logging: false,
  migrations: [join(__dirname, '..', '..', '**', 'migrations', '*.{ts,js}')],
  // ssl: { rejectUnauthorized: false },
};

export const postgresConnectionUri = `postgres://${databaseConfig.username}:${databaseConfig.password}@${databaseConfig.host}/${databaseConfig.database}`;
export const dataSource = new BaseDataSource(databaseConfig);
