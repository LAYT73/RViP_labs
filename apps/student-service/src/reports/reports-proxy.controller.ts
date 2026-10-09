import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseCountDto } from './course-count.dto';
import {
  ExportByCourseResult,
  ReportsProxyService,
} from './reports-proxy.service';

@ApiTags('reports')
@Controller('api/reports')
export class ReportsProxyController {
  constructor(private readonly reportsProxy: ReportsProxyService) {}

  @Get('by-course')
  @ApiOperation({ summary: 'Course enrollment report (via report-service HttpService)' })
  byCourse(): Promise<CourseCountDto[]> {
    return this.reportsProxy.byCourse();
  }

  @Get('by-course/export')
  @ApiOperation({
    summary: 'Queue course report CSV export (report → RabbitMQ → file-storage)',
  })
  exportByCourse(): Promise<ExportByCourseResult> {
    return this.reportsProxy.exportByCourse();
  }
}
