export const REPORT_FILENAME = 'report-by-course.csv';

export function exportToStore(data: {
  content?: string;
  filename?: string;
} | null | undefined): { content: string; filename: string } {
  const filename = data?.filename?.trim() ? data.filename : REPORT_FILENAME;
  return { content: data?.content ?? '', filename };
}
