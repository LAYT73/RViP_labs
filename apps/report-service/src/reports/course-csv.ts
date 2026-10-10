export function courseReportCsv(rows: { course: number; count: number }[]): string {
  return ['course,count', ...rows.map((row) => `${row.course},${row.count}`)].join('\n') + '\n';
}
