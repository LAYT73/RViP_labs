import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BadGatewayException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { courseReportCsv } from './course-csv';
import { postCourseCsv } from './post-course-csv';

describe('course export', () => {
  it('writes a header and rows', () => {
    assert.equal(courseReportCsv([{ course: 2, count: 1 }, { course: 3, count: 3 }]), 'course,count\n2,1\n3,3\n');
  });

  it('posts the csv and keeps the rows', async () => {
    let sent = '';
    const result = await postCourseCsv([{ course: 2, count: 1 }], 'http://file-storage:3003', (_url, body) => {
      sent = body.content;
      return of({
        data: {
          id: 'id-1',
          objectKey: 'reports/id-1.csv',
          bucket: 'reports',
          size: sent.length,
          contentType: 'text/csv',
          createdAt: '2026-10-10T00:00:00.000Z',
        },
      });
    });
    assert.equal(sent, 'course,count\n2,1\n');
    assert.equal(result.rows[0].count, 1);
  });

  it('turns a dead storage call into 502', async () => {
    await assert.rejects(
      () => postCourseCsv([{ course: 1, count: 1 }], 'http://file-storage:3003', () => throwError(() => new Error('down'))),
      (err: unknown) => err instanceof BadGatewayException,
    );
  });
});
