import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  const studentUrl = config.get<string>('STUDENT_SERVICE_URL', 'http://localhost:3001');
  const reportUrl = config.get<string>('REPORT_SERVICE_URL', 'http://localhost:3002');

  const expressApp = app.getHttpAdapter().getInstance();

  expressApp.use(
    createProxyMiddleware({
      target: studentUrl,
      changeOrigin: true,
      pathFilter: '/api/students',
    }),
  );

  expressApp.use(
    createProxyMiddleware({
      target: reportUrl,
      changeOrigin: true,
      pathFilter: '/api/reports',
    }),
  );

  const port = config.get<string>('PORT') ? Number(config.get<string>('PORT')) : 3000;
  await app.listen(port);
}

bootstrap();
