import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateBucketCommand,
  HeadBucketCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { FileMetadataDto } from './file-metadata.dto';
import { putReport, headReport, readReport } from './s3-files';
import { storageFailure } from './storage-errors';

@Injectable()
export class FilesService implements OnModuleInit {
  private readonly logger = new Logger(FilesService.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(config: ConfigService) {
    const endpoint = config.get<string>('MINIO_ENDPOINT', 'http://localhost:9000');
    const accessKey = config.get<string>('MINIO_ACCESS_KEY', 'minioadmin');
    const secretKey = config.get<string>('MINIO_SECRET_KEY', 'minioadmin');
    this.bucket = config.get<string>('MINIO_BUCKET', 'reports');

    this.client = new S3Client({
      endpoint,
      region: 'us-east-1',
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.ensureBucket();
  }

  private async ensureBucket(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      return;
    } catch {
      this.logger.log(`Creating bucket ${this.bucket}`);
    }
    try {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
    } catch (err) {
      // Concurrent create / already-owned is fine for lab demos.
      const name = (err as { name?: string }).name ?? '';
      if (!/BucketAlreadyOwnedByYou|BucketAlreadyExists/i.test(name)) {
        try {
          await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
        } catch {
          throw err;
        }
      }
    }
  }

  async store(content: string, filename?: string): Promise<FileMetadataDto> {
    await this.ensureBucket();
    try {
      return await putReport(this.client, this.bucket, content, filename);
    } catch (err) {
      throw this.toHttp(err, 'new');
    }
  }

  async getMetadata(id: string): Promise<FileMetadataDto> {
    try {
      return await headReport(this.client, this.bucket, id);
    } catch (err) {
      throw this.toHttp(err, id);
    }
  }

  async getContent(id: string): Promise<string> {
    try {
      return await readReport(this.client, this.bucket, id);
    } catch (err) {
      throw this.toHttp(err, id);
    }
  }

  private toHttp(err: unknown, id: string): BadRequestException | NotFoundException | ServiceUnavailableException {
    const message = err instanceof Error ? err.message : '';
    if (message === 'content is required' || message === 'content is too large') {
      return new BadRequestException(message);
    }
    if (storageFailure(err) === 'missing') {
      return new NotFoundException(`File ${id} not found`);
    }
    this.logger.error(`Object storage error for ${id}`);
    return new ServiceUnavailableException('Object storage is unavailable');
  }
}
