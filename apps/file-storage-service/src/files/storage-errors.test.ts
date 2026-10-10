import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MAX_FILE_CHARS, safeFilename, storageFailure } from './storage-errors';

describe('storageFailure', () => {
  it('maps a missing object to missing', () => {
    assert.equal(storageFailure({ name: 'NoSuchKey' }), 'missing');
    assert.equal(storageFailure({ name: 'NotFound' }), 'missing');
  });

  it('maps network and server faults to unavailable', () => {
    assert.equal(storageFailure({ name: 'NetworkingError' }), 'unavailable');
    assert.equal(storageFailure({ name: 'InternalError', Code: 'InternalError' }), 'unavailable');
  });
});

describe('safeFilename', () => {
  it('drops directories and odd characters', () => {
    assert.equal(safeFilename('../etc/passwd'), 'passwd');
    assert.equal(safeFilename('отчёт.csv'), '_.csv');
  });

  it('falls back when empty', () => {
    assert.equal(safeFilename('   '), 'report.csv');
    assert.equal(safeFilename(undefined), 'report.csv');
  });

  it('keeps content limit explicit', () => {
    assert.equal(MAX_FILE_CHARS, 1_000_000);
  });
});
