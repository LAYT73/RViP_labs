import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/student.entity';
import { CourseCountDto } from './course-count.dto';
import { postCourseCsv } from './post-course-csv';

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
    return postCourseCsv(rows, this.fileStorageUrl, (url, body) => this.http.post(url, body));
  }
}
