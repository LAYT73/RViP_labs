import type { NextFunction, Request, Response } from 'express';
import axios from 'axios';

const cacheTtlMs = 2000;
const healthyUntil = new Map<string, number>();

export function createUpstreamHealthGuard(serviceBaseUrl: string, serviceName: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const now = Date.now();
    const cachedUntil = healthyUntil.get(serviceBaseUrl) ?? 0;
    if (cachedUntil > now) {
      next();
      return;
    }

    try {
      const response = await axios.get(`${serviceBaseUrl}/health`, {
        timeout: 1500,
        validateStatus: (status) => status === 200,
      });
      if (response.data?.status !== 'ok') {
        throw new Error('unhealthy');
      }
      healthyUntil.set(serviceBaseUrl, now + cacheTtlMs);
      next();
    } catch {
      healthyUntil.delete(serviceBaseUrl);
      res.status(503).json({
        statusCode: 503,
        message: `${serviceName} is unavailable`,
        error: 'Service Unavailable',
      });
    }
  };
}
