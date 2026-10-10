import { CourseCountDto } from './course-count.dto';
import { courseReportCsv } from './course-csv';

export const REPORT_EXPORT_PATTERN = 'report.export.csv';
export const REPORT_FILENAME = 'report-by-course.csv';

export type ReportExportMessage = {
  filename: string;
  content: string;
  requestedAt: string;
};

export type QueuedExport = {
  status: 'queued';
  jobId: string;
  rows: CourseCountDto[];
  filename: string;
};

export function buildQueuedExport(
  rows: CourseCountDto[],
  jobId: string,
  requestedAt: string,
): { message: ReportExportMessage; result: QueuedExport } {
  const content = courseReportCsv(rows);
  return {
    message: { filename: REPORT_FILENAME, content, requestedAt },
    result: { status: 'queued', jobId, rows, filename: REPORT_FILENAME },
  };
}
