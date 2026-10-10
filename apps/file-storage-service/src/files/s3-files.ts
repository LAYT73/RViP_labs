import { GetObjectCommand, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { FileMetadataDto } from './file-metadata.dto';
import { MAX_FILE_CHARS, safeFilename, storageFailure } from './storage-errors';

export type ObjectClient = {
  send: (command: unknown) => Promise<{
    ContentLength?: number;
    ContentType?: string;
    Metadata?: Record<string, string>;
    Body?: { transformToString: (enc: string) => Promise<string> };
  }>;
};

export function parseStoreJson(body: unknown): { content: string; filename?: string } {
  if (!body || typeof body !== 'object') {
    throw new Error('content is required');
  }
  const record = body as { content?: unknown; filename?: unknown };
  if (typeof record.content !== 'string' || record.content.length === 0) {
    throw new Error('content is required');
  }
  if (record.content.length > MAX_FILE_CHARS) {
    throw new Error('content is too large');
  }
  if (record.filename !== undefined && (typeof record.filename !== 'string' || record.filename.length > 120)) {
    throw new Error('filename is invalid');
  }
  return {
    content: record.content,
    filename: typeof record.filename === 'string' ? record.filename : undefined,
  };
}

export async function putReport(
  client: ObjectClient,
  bucket: string,
  content: string,
  filename?: string,
): Promise<FileMetadataDto> {
  if (content.length === 0) {
    throw new Error('content is required');
  }
  if (content.length > MAX_FILE_CHARS) {
    throw new Error('content is too large');
  }
  const storedName = safeFilename(filename);
  const id = randomUUID();
  const objectKey = `reports/${id}.csv`;
  const createdAt = new Date().toISOString();
  const body = Buffer.from(content, 'utf8');
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: body,
      ContentType: 'text/csv',
      Metadata: { id, filename: storedName, createdat: createdAt },
    }),
  );
  return {
    id,
    objectKey,
    bucket,
    size: body.length,
    contentType: 'text/csv',
    filename: storedName,
    createdAt,
  };
}

export async function headReport(client: ObjectClient, bucket: string, id: string): Promise<FileMetadataDto> {
  const objectKey = `reports/${id}.csv`;
  try {
    const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: objectKey }));
    return {
      id,
      objectKey,
      bucket,
      size: head.ContentLength ?? 0,
      contentType: head.ContentType ?? 'text/csv',
      filename: head.Metadata?.filename ?? 'report.csv',
      createdAt: head.Metadata?.createdat ?? new Date(0).toISOString(),
    };
  } catch (err) {
    throw storageError(err);
  }
}

export async function readReport(client: ObjectClient, bucket: string, id: string): Promise<string> {
  const objectKey = `reports/${id}.csv`;
  try {
    const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: objectKey }));
    if (!result.Body) {
      throw Object.assign(new Error('missing'), { name: 'NoSuchKey' });
    }
    return result.Body.transformToString('utf8');
  } catch (err) {
    throw storageError(err);
  }
}

function storageError(err: unknown): Error {
  if (storageFailure(err) === 'missing') {
    return Object.assign(new Error('missing'), { name: 'NoSuchKey' });
  }
  return Object.assign(new Error('unavailable'), { name: 'NetworkingError' });
}
