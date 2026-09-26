import type { NextFunction, Request, Response } from 'express';
import axios from 'axios';

const cacheTtlMs = 2000;
const healthyUntil = new Map<string, number>();

export async function isUpstreamHealthy(serviceBaseUrl: string): Promise<boolean> {
  const now = Date.now();
  const cachedUntil = healthyUntil.get(serviceBaseUrl) ?? 0;
  if (cachedUntil > now) {
    return true;
  }

  try {
    const response = await axios.get(`${serviceBaseUrl}/health`, {
      timeout: 1500,
      validateStatus: (status) => status === 200,
    });
    if (response.data?.status !== 'ok') {
      healthyUntil.delete(serviceBaseUrl);
      return false;
    }
    healthyUntil.set(serviceBaseUrl, now + cacheTtlMs);
    return true;
  } catch {
    healthyUntil.delete(serviceBaseUrl);
    return false;
  }
}

export function createUpstreamHealthGuard(serviceBaseUrl: string, serviceName: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (await isUpstreamHealthy(serviceBaseUrl)) {
      next();
      return;
    }
    res.status(503).json({
      statusCode: 503,
      message: `${serviceName} is unavailable`,
      error: 'Service Unavailable',
    });
  };
}

/** Случайный healthy инстанс; если все down — null */
export async function pickRandomHealthyUrl(urls: string[]): Promise<string | null> {
  const shuffled = [...urls].sort(() => Math.random() - 0.5);
  for (const url of shuffled) {
    if (await isUpstreamHealthy(url)) {
      return url;
    }
  }
  return null;
}
