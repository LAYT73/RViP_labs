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
import { validate } from 'class-validator';
import { FileMetadataDto } from './file-metadata.dto';
import { FilesService } from './files.service';
import { parseStoreJson } from './s3-files';
import { StoreFileDto } from './store-file.dto';

@Controller('api/files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  async store(
    @Headers('content-type') contentType: string | undefined,
    @Body() body: unknown,
  ): Promise<FileMetadataDto> {
    const type = (contentType ?? '').toLowerCase();

    if (type.includes('application/json')) {
      let parsed: { content: string; filename?: string };
      try {
        parsed = parseStoreJson(body);
      } catch (err) {
        throw new BadRequestException(err instanceof Error ? err.message : 'bad request');
      }
      const payload = plainToInstance(StoreFileDto, parsed);
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
