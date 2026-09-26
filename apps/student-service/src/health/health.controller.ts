import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import axios from 'axios';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {}

  @Get()
  async check(): Promise<{ status: string; report?: string }> {
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      throw new ServiceUnavailableException({ status: 'error', db: 'down' });
    }

    const reportUrl = this.config.get<string>(
      'REPORT_SERVICE_URL',
      'http://localhost:3002',
    );

    try {
      const response = await axios.get(`${reportUrl}/health`, {
        timeout: 1500,
        validateStatus: (status) => status === 200,
      });
      if (response.data?.status !== 'ok') {
        throw new Error('report unhealthy');
      }
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        report: 'down',
      });
    }

    return { status: 'ok', report: 'ok' };
  }
}
