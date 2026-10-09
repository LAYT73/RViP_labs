import {
  BadGatewayException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { Student } from '../students/student.entity';
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
export class ReportsService {
  private readonly fileStorageUrl: string;

  constructor(
    @InjectRepository(Student)
    private readonly students: Repository<Student>,
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.fileStorageUrl = config.get<string>(
      'FILE_STORAGE_SERVICE_URL',
      'http://localhost:3003',
    );
  }

  async byCourse(): Promise<CourseCountDto[]> {
    const rows = await this.students
      .createQueryBuilder('s')
      .select('s.course', 'course')
      .addSelect('COUNT(*)', 'count')
      .where('s.status = :status', { status: 'ENROLLED' })
      .groupBy('s.course')
      .orderBy('s.course', 'ASC')
      .getRawMany<{ course: string; count: string }>();

    return rows.map((row) => ({
      course: Number(row.course),
      count: Number(row.count),
    }));
  }

  async exportByCourse(): Promise<ExportByCourseResult> {
    const rows = await this.byCourse();
    const csv =
      ['course,count', ...rows.map((r) => `${r.course},${r.count}`)].join('\n') +
      '\n';
    try {
      const response = await firstValueFrom(
        this.http.post<StoredFileMeta>(`${this.fileStorageUrl}/api/files`, {
          filename: 'report-by-course.csv',
          content: csv,
        }),
      );
      return { ...response.data, rows };
    } catch {
      throw new BadGatewayException('File storage service is unavailable');
    }
  }
}
