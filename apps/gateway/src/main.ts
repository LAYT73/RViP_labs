import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AppModule } from './app.module';
import { createUpstreamHealthGuard } from './upstream-health.guard';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  const studentUrl = config.get<string>('STUDENT_SERVICE_URL', 'http://localhost:3001');

  const expressApp = app.getHttpAdapter().getInstance();
  const studentHealth = createUpstreamHealthGuard(studentUrl, 'student-service');

  // Lab 3: оба пути идут в student-service; его /health ещё проверяет report
  expressApp.use(async (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/students') || req.path.startsWith('/api/reports')) {
      await studentHealth(req, res, next);
      return;
    }
    next();
  });

  expressApp.use(
    createProxyMiddleware({
      target: studentUrl,
      changeOrigin: true,
      pathFilter: '/api/students',
    }),
  );

  expressApp.use(
    createProxyMiddleware({
      target: studentUrl,
      changeOrigin: true,
      pathFilter: '/api/reports',
    }),
  );

  const port = config.get<string>('PORT') ? Number(config.get<string>('PORT')) : 3000;
  await app.listen(port);
}

bootstrap();
