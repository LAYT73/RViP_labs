import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AppModule } from './app.module';
import {
  createUpstreamHealthGuard,
  pickRandomHealthyUrl,
} from './upstream-health.guard';

function parseReportUrls(config: ConfigService): string[] {
  const list = config.get<string>('REPORT_SERVICE_URLS');
  if (list?.trim()) {
    return list
      .split(',')
      .map((u) => u.trim())
      .filter(Boolean);
  }
  const single = config.get<string>('REPORT_SERVICE_URL', 'http://localhost:3002');
  return [single];
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  const studentUrl = config.get<string>('STUDENT_SERVICE_URL', 'http://localhost:3001');
  const reportUrls = parseReportUrls(config);

  const expressApp = app.getHttpAdapter().getInstance();
  const studentHealth = createUpstreamHealthGuard(studentUrl, 'student-service');

  expressApp.use(async (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/students')) {
      await studentHealth(req, res, next);
      return;
    }
    if (req.path.startsWith('/api/reports')) {
      const chosen = await pickRandomHealthyUrl(reportUrls);
      if (!chosen) {
        res.status(503).json({
          statusCode: 503,
          message: 'report-service is unavailable',
          error: 'Service Unavailable',
        });
        return;
      }
      (req as Request & { reportUpstream?: string }).reportUpstream = chosen;
      res.setHeader('X-Report-Upstream', chosen);
      next();
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
      target: reportUrls[0],
      changeOrigin: true,
      pathFilter: '/api/reports',
      router: (req) =>
        (req as Request & { reportUpstream?: string }).reportUpstream ?? reportUrls[0],
    }),
  );

  const port = config.get<string>('PORT') ? Number(config.get<string>('PORT')) : 3000;
  await app.listen(port);
}

bootstrap();
