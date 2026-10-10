import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { exportToStore } from './export-message';

describe('export message', () => {
  it('stores the csv under the name from the queue', () => {
    assert.deepEqual(
      exportToStore({ content: 'course,count\n1,2\n', filename: 'report-by-course.csv' }),
      { content: 'course,count\n1,2\n', filename: 'report-by-course.csv' },
    );
  });

  it('does not turn a blank filename into an empty object name', () => {
    assert.deepEqual(exportToStore({ content: 'course,count\n', filename: '  ' }), {
      content: 'course,count\n',
      filename: 'report-by-course.csv',
    });
    assert.deepEqual(exportToStore(undefined), {
      content: '',
      filename: 'report-by-course.csv',
    });
  });
});
