import 'reflect-metadata';
import express, { type Express } from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';

// serverless-http wraps a handler for AWS Lambda's (event, context) calling
// convention. Vercel's Node runtime calls the export as plain (req, res) —
// passing Vercel's req/res into a Lambda-shaped function silently breaks.
// An Express app instance is already a valid (req, res) handler on its own,
// so just expose that directly instead of wrapping it in anything.
let cachedApp: Express | null = null;

async function bootstrap(): Promise<Express> {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  app.enableCors();
  await app.init();
  return expressApp;
}

export default async function handler(req: any, res: any) {
  if (!cachedApp) {
    cachedApp = await bootstrap();
  }
  return cachedApp(req, res);
}
