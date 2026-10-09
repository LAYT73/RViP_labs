import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { FilesService } from './files.service';

export type ReportExportMessage = {
  filename: string;
  content: string;
  requestedAt: string;
};

@Controller()
export class ReportExportConsumer {
  private readonly logger = new Logger(ReportExportConsumer.name);

  constructor(private readonly filesService: FilesService) {}

  @EventPattern('report.export.csv')
  async handleExport(@Payload() data: ReportExportMessage): Promise<void> {
    this.logger.log(
      `Consuming report.export.csv filename=${data?.filename} requestedAt=${data?.requestedAt}`,
    );
    await this.filesService.store(
      data.content,
      data.filename ?? 'report-by-course.csv',
    );
  }
}
