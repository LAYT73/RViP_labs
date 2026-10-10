import { CourseCountDto } from './course-count.dto';

export function courseReportCsv(rows: CourseCountDto[]): string {
  return (
    ['course,count', ...rows.map((row) => `${row.course},${row.count}`)].join('\n') +
    '\n'
  );
}
