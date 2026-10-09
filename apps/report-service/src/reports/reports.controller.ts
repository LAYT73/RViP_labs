import { Controller, Get } from '@nestjs/common';
import { CourseCountDto } from './course-count.dto';
import { ExportByCourseResult, ReportsService } from './reports.service';

@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('by-course')
  byCourse(): Promise<CourseCountDto[]> {
    return this.reportsService.byCourse();
  }

  @Get('by-course/export')
  exportByCourse(): Promise<ExportByCourseResult> {
    return this.reportsService.exportByCourse();
  }
}
