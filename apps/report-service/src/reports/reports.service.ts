import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/student.entity';
import { CourseCountDto } from './course-count.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Student)
    private readonly students: Repository<Student>,
  ) {}

  async byCourse(): Promise<CourseCountDto[]> {
    const rows = await this.students
      .createQueryBuilder('s')
      .select('s.course', 'course')
      .addSelect('COUNT(*)', 'count')
      .where('s.status = :status', { status: 'ENROLLED' })
      .groupBy('s.course')
      .orderBy('s.course', 'ASC')
      .getRawMany<{ course: string; count: string }>();

    return rows.map((row) => ({
      course: Number(row.course),
      count: Number(row.count),
    }));
  }
}
