import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CourseCountDto } from './course-count.dto';

export type StoredFileMeta = {
  id: string;
  objectKey: string;
  bucket: string;
  size: number;
  contentType: string;
  createdAt: string;
};

export type ExportByCourseResult = StoredFileMeta & {
  rows: CourseCountDto[];
};

@Injectable()
export class ReportsProxyService {
  private readonly reportBaseUrl: string;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.reportBaseUrl = config.get<string>(
      'REPORT_SERVICE_URL',
      'http://localhost:3002',
    );
  }

  async byCourse(): Promise<CourseCountDto[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<CourseCountDto[]>(`${this.reportBaseUrl}/api/reports/by-course`),
      );
      return response.data;
    } catch {
      throw new BadGatewayException('Report service is unavailable');
    }
  }

  async exportByCourse(): Promise<ExportByCourseResult> {
    try {
      const response = await firstValueFrom(
        this.http.get<ExportByCourseResult>(
          `${this.reportBaseUrl}/api/reports/by-course/export`,
        ),
      );
      return response.data;
    } catch {
      throw new BadGatewayException('Report service is unavailable');
    }
  }
}
