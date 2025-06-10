import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import { get } from 'env-var';
import * as express from 'express';
import rateLimit from 'express-rate-limit';
import { existsSync, mkdirSync, writeFile } from 'fs';
import helmet from 'helmet';
import { join } from 'path';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { AppModule } from './app.module';

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
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: [
      'http://45.88.223.182:4000', // Add server IP
      'https://neatly-rare-aardvark.ngrok-free.app',
      'http://localhost:3000',
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
    exposedHeaders: ['ngrok-skip-browser-warning'], // MUST BE ADDED HERE
    methods: ['DELETE', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT']
  });
  app.setGlobalPrefix('api');

  setupMiddlewares(app);
  setTemplateEngine(app);
  if (get('NODE_ENV').asString() === 'production') setupRateLimiter(app);
  

  // In setupMiddlewares:
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // Add this line
    }),
  );

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));


  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  await app.listen(get('PORT').required().asString());
  console.log(`🚀 Server running on port ${get('PORT').required().asString()}`);
}

bootstrap();
