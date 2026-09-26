import './apm';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TraceLoggingInterceptor } from './trace-logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new TraceLoggingInterceptor());
  const port = process.env.PORT ? Number(process.env.PORT) : 3002;
  await app.listen(port);
}

bootstrap();
