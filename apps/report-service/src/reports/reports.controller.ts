import { Controller, Get } from '@nestjs/common';
import { CourseCountDto } from './course-count.dto';
import { ReportsService } from './reports.service';

@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('by-course')
  byCourse(): Promise<CourseCountDto[]> {
    return this.reportsService.byCourse();
  }
}
