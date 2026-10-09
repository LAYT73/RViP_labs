import './apm';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { json, text } from 'express';
import { AppModule } from './app.module';
import { TraceLoggingInterceptor } from './trace-logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.use(json({ limit: '10mb' }));
  app.use(text({ type: ['text/csv', 'text/plain'], limit: '10mb' }));
  app.useGlobalInterceptors(new TraceLoggingInterceptor());

  const rabbitUrl =
    process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672';
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUrl],
      queue: 'report.export.csv',
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();
  const port = process.env.PORT ? Number(process.env.PORT) : 3003;
  await app.listen(port);
}

bootstrap();
