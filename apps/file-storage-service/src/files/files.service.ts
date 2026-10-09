import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { FileMetadataDto } from './file-metadata.dto';

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
    } catch {
      this.logger.log(`Creating bucket ${this.bucket}`);
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
    }
  }

  private objectKeyFor(id: string): string {
    return `reports/${id}.csv`;
  }

  async store(content: string, filename = 'report.csv'): Promise<FileMetadataDto> {
    if (content === undefined || content === null) {
      throw new BadRequestException('content is required');
    }

    const id = randomUUID();
    const objectKey = this.objectKeyFor(id);
    const createdAt = new Date().toISOString();
    const body = Buffer.from(content, 'utf8');
    const contentType = 'text/csv';

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
        Body: body,
        ContentType: contentType,
        Metadata: {
          id,
          filename,
          createdat: createdAt,
        },
      }),
    );

    return {
      id,
      objectKey,
      bucket: this.bucket,
      size: body.length,
      contentType,
      createdAt,
    };
  }

  async getMetadata(id: string): Promise<FileMetadataDto> {
    const objectKey = this.objectKeyFor(id);
    try {
      const head = await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: objectKey }),
      );

      return {
        id,
        objectKey,
        bucket: this.bucket,
        size: head.ContentLength ?? 0,
        contentType: head.ContentType ?? 'text/csv',
        createdAt: head.Metadata?.createdat ?? new Date(0).toISOString(),
      };
    } catch {
      throw new NotFoundException(`File ${id} not found`);
    }
  }

  async getContent(id: string): Promise<string> {
    const objectKey = this.objectKeyFor(id);
    try {
      const result = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: objectKey }),
      );

      if (!result.Body) {
        throw new NotFoundException(`File ${id} not found`);
      }

      return result.Body.transformToString('utf8');
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new NotFoundException(`File ${id} not found`);
    }
  }
}
