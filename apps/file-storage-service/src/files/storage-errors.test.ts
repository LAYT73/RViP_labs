import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { headReport, parseStoreJson, putReport, readReport } from './s3-files';
import { MAX_FILE_CHARS, safeFilename, storageFailure } from './storage-errors';

describe('storageFailure', () => {
  it('maps a missing object to missing', () => {
    assert.equal(storageFailure({ name: 'NoSuchKey' }), 'missing');
    assert.equal(storageFailure({ name: 'NotFound' }), 'missing');
  });

  it('maps network and server faults to unavailable', () => {
    assert.equal(storageFailure({ name: 'NetworkingError' }), 'unavailable');
  });
});

describe('safeFilename', () => {
  it('drops directories', () => {
    assert.equal(safeFilename('../etc/passwd'), 'passwd');
    assert.equal(safeFilename(undefined), 'report.csv');
  });
});

describe('parseStoreJson', () => {
  it('rejects an empty body and an oversized csv', () => {
    assert.throws(() => parseStoreJson({}), /content is required/);
    assert.throws(() => parseStoreJson({ content: 'x'.repeat(MAX_FILE_CHARS + 1) }), /content is too large/);
    assert.throws(() => parseStoreJson({ content: 'ok', filename: 'a'.repeat(121) }), /filename is invalid/);
  });

  it('accepts a short csv', () => {
    assert.deepEqual(parseStoreJson({ content: 'course,count\n', filename: 'a.csv' }), {
      content: 'course,count\n',
      filename: 'a.csv',
    });
  });
});

describe('s3 files', () => {
  it('stores csv under a generated key', async () => {
    let command: PutObjectCommand | undefined;
    const saved = await putReport(
      {
        send: async (value) => {
          command = value as PutObjectCommand;
          return {};
        },
      },
      'reports',
      'course,count\n1,1\n',
      '../a.csv',
    );
    assert.equal(saved.filename, 'a.csv');
    assert.match(saved.objectKey, /^reports\/.+\.csv$/);
    assert.ok(command instanceof PutObjectCommand);
  });

  it('reads bytes back', async () => {
    const text = await readReport(
      {
        send: async (value) => {
          assert.ok(value instanceof GetObjectCommand);
          return { Body: { transformToString: async () => 'course,count\n' } };
        },
      },
      'reports',
      '11111111-1111-1111-1111-111111111111',
    );
    assert.equal(text, 'course,count\n');
  });

  it('reports a missing key and a storage outage differently', async () => {
    const missing = headReport(
      {
        send: async (value) => {
          assert.ok(value instanceof HeadObjectCommand);
          throw Object.assign(new Error('nope'), { name: 'NoSuchKey' });
        },
      },
      'reports',
      '11111111-1111-1111-1111-111111111111',
    );
    await assert.rejects(missing, (err: unknown) => (err as { name?: string }).name === 'NoSuchKey');

    const down = readReport(
      {
        send: async () => {
          throw Object.assign(new Error('down'), { name: 'NetworkingError' });
        },
      },
      'reports',
      '11111111-1111-1111-1111-111111111111',
    );
    await assert.rejects(down, (err: unknown) => (err as { name?: string }).name === 'NetworkingError');
  });
});
