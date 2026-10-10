import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { Student } from '../students/student.entity';
import { CourseCountDto } from './course-count.dto';
import {
  buildQueuedExport,
  REPORT_EXPORT_PATTERN,
  type QueuedExport,
  type ReportExportMessage,
} from './queue-export';

export const REPORT_EXPORT_QUEUE = 'REPORT_EXPORT_QUEUE';
export { REPORT_EXPORT_PATTERN };
export type { ReportExportMessage, QueuedExport as ExportByCourseResult };

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Student)
    private readonly students: Repository<Student>,
    @Inject(REPORT_EXPORT_QUEUE)
    private readonly exportQueue: ClientProxy,
  ) {}

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

  async exportByCourse(): Promise<QueuedExport> {
    const rows = await this.byCourse();
    const { message, result } = buildQueuedExport(
      rows,
      randomUUID(),
      new Date().toISOString(),
    );

    await firstValueFrom(this.exportQueue.emit(REPORT_EXPORT_PATTERN, message));
    return result;
  }
}
