import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseCountDto } from './course-count.dto';
import { ReportsProxyService } from './reports-proxy.service';

@ApiTags('reports')
@Controller('api/reports')
export class ReportsProxyController {
  constructor(private readonly reportsProxy: ReportsProxyService) {}

  @Get('by-course')
  @ApiOperation({ summary: 'Course enrollment report (via report-service HttpService)' })
  byCourse(): Promise<CourseCountDto[]> {
    return this.reportsProxy.byCourse();
  }
}
