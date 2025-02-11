import helmet from 'helmet';
import { get } from 'env-var';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import * as compression from 'compression';
import { NestFactory } from '@nestjs/core';
import rateLimit from 'express-rate-limit';
import { existsSync, mkdirSync, writeFile } from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { join } from 'path';
import * as express from 'express';

function initializeLogging() {
  const logDir = 'logs';
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
    writeFile(`${logDir}/logs.out`, '', (err) => {
      if (err) console.log(err);
    });
  }
}

function setupMiddlewares(app: NestExpressApplication) {
  app.use(json());
  app.use(compression());
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
}

function setupRateLimiter(app: NestExpressApplication) {
  app.use(rateLimit({ windowMs: 60000, max: 100 }));
}

function setTemplateEngine(app: NestExpressApplication) {
  app.setViewEngine('pug');
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
}

async function bootstrap(): Promise<void> {
  initializeTransactionalContext();

  if (get('NODE_ENV').asString() === 'production') initializeLogging();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: { origin: '*' },
  });

  app.use(json()); // Ensure JSON support
  app.use(urlencoded({ extended: true })); // Ensure form data parsing

  app.setGlobalPrefix('api');

  setupMiddlewares(app);

  setTemplateEngine(app);
  if (get('NODE_ENV').asString() === 'production') setupRateLimiter(app);

  app.use(express.json()); // Ensure JSON support
  app.use(express.urlencoded({ extended: true })); // Ensure form data parsing
  await app.listen(get('PORT').required().asString());
}
bootstrap();
