import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength, validate } from 'class-validator';
import { FileMetadataDto } from './file-metadata.dto';
import { FilesService } from './files.service';
import { MAX_FILE_CHARS } from './storage-errors';

class StoreFileDto {
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_FILE_CHARS)
  content!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  filename?: string;
}

@Controller('api/files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  store(
    @Headers('content-type') contentType: string | undefined,
    @Body() body: unknown,
  ): Promise<FileMetadataDto> {
    const type = (contentType ?? '').toLowerCase();

    if (type.includes('application/json')) {
      const payload = plainToInstance(StoreFileDto, body);
      const errors = await validate(payload);
      if (errors.length > 0) {
        throw new BadRequestException('JSON body must include string content up to 1 MB');
      }
      return this.filesService.store(payload.content, payload.filename);
    }

    if (typeof body === 'string') {
      return this.filesService.store(body, 'report.csv');
    }

    throw new BadRequestException(
      'Expected Content-Type application/json or text/csv',
    );
  }

  @Get(':id')
  getMetadata(@Param('id') id: string): Promise<FileMetadataDto> {
    return this.filesService.getMetadata(id);
  }

  @Get(':id/content')
  async getContent(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const content = await this.filesService.getContent(id);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    return content;
  }
}
