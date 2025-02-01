import { config } from 'dotenv';
import * as path from 'path';

// Initializing dotenv
const envPath: string = path.resolve(
  process.cwd() +
    (process.env.NODE_ENV === 'developement' ? '/.env' : '/.env.test'),
);

config({ path: envPath });
