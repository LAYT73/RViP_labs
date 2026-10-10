import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { courseReportCsv } from './course-csv';
import { buildQueuedExport } from './queue-export';

describe('queued course export', () => {
  it('writes a header and rows', () => {
    assert.equal(courseReportCsv([{ course: 2, count: 4 }]), 'course,count\n2,4\n');
  });

  it('answers queued and puts the same csv in the message', () => {
    const rows = [{ course: 1, count: 3 }];
    const { message, result } = buildQueuedExport(rows, 'job-1', '2026-10-10T00:00:00.000Z');

    assert.equal(result.status, 'queued');
    assert.equal(result.jobId, 'job-1');
    assert.equal(result.filename, 'report-by-course.csv');
    assert.deepEqual(result.rows, rows);
    assert.equal(message.content, courseReportCsv(rows));
    assert.equal(message.filename, result.filename);
    assert.equal(message.requestedAt, '2026-10-10T00:00:00.000Z');
  });
});
