import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { MAX_FILE_CHARS } from './storage-errors';

export class StoreFileDto {
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_FILE_CHARS)
  content!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  filename?: string;
}
