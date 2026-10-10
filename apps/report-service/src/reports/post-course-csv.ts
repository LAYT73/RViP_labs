import { BadGatewayException } from '@nestjs/common';
import { firstValueFrom, Observable } from 'rxjs';
import type { CourseCountDto } from './course-count.dto';
import { courseReportCsv } from './course-csv';
import type { ExportByCourseResult, StoredFileMeta } from './reports.service';

type Post = (url: string, body: { filename: string; content: string }) => Observable<{ data: StoredFileMeta }>;

export async function postCourseCsv(
  rows: CourseCountDto[],
  fileStorageUrl: string,
  post: Post,
): Promise<ExportByCourseResult> {
  const csv = courseReportCsv(rows);
  try {
    const response = await firstValueFrom(
      post(`${fileStorageUrl}/api/files`, {
        filename: 'report-by-course.csv',
        content: csv,
      }),
    );
    return { ...response.data, rows };
  } catch (err) {
    if (err instanceof BadGatewayException) {
      throw err;
    }
    throw new BadGatewayException('File storage service is unavailable');
  }
}
