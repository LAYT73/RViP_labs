import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { exportToStore } from './export-message';
import { FilesService } from './files.service';

@Controller()
export class ReportExportConsumer {
  private readonly logger = new Logger(ReportExportConsumer.name);

  constructor(private readonly filesService: FilesService) {}

  @EventPattern('report.export.csv')
  async handleExport(
    @Payload() data: { content?: string; filename?: string; requestedAt?: string },
  ): Promise<void> {
    const stored = exportToStore(data);
    this.logger.log(
      `Consuming report.export.csv filename=${stored.filename} requestedAt=${data?.requestedAt}`,
    );
    await this.filesService.store(stored.content, stored.filename);
  }
}
