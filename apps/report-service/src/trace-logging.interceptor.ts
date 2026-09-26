import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import apm from './apm';

@Injectable()
export class TraceLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const started = Date.now();
    const ids = apm.currentTraceIds;
    const traceId = ids['trace.id'] ?? '-';

    res.setHeader('X-Trace-Id', traceId);

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(
            JSON.stringify({
              msg: 'request',
              method: req.method,
              path: req.originalUrl ?? req.url,
              statusCode: res.statusCode,
              durationMs: Date.now() - started,
              traceId,
              service: process.env.ELASTIC_APM_SERVICE_NAME,
            }),
          );
        },
        error: (err: Error) => {
          apm.captureError(err);
          this.logger.error(
            JSON.stringify({
              msg: 'request_error',
              method: req.method,
              path: req.originalUrl ?? req.url,
              durationMs: Date.now() - started,
              traceId,
              error: err.message,
              service: process.env.ELASTIC_APM_SERVICE_NAME,
            }),
          );
        },
      }),
    );
  }
}
