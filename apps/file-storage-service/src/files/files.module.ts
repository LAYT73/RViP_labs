import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { ReportExportConsumer } from './report-export.consumer';

@Module({
  controllers: [FilesController, ReportExportConsumer],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
