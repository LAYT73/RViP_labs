import './apm';
import { NestFactory } from '@nestjs/core';
import { json, text } from 'express';
import { AppModule } from './app.module';
import { TraceLoggingInterceptor } from './trace-logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.use(json({ limit: '10mb' }));
  app.use(text({ type: ['text/csv', 'text/plain'], limit: '10mb' }));
  app.useGlobalInterceptors(new TraceLoggingInterceptor());

  const port = process.env.PORT ? Number(process.env.PORT) : 3003;
  await app.listen(port);
}

bootstrap();
