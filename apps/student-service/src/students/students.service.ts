import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto';
import { TransferStudentDto } from './dto/transfer-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './student.entity';
import { StudentStatus } from './student-status.enum';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly students: Repository<Student>,
  ) {}

  enroll(dto: CreateStudentDto): Promise<Student> {
    const student = this.students.create({
      fullName: dto.fullName,
      course: dto.course,
      status: StudentStatus.ENROLLED,
    });
    return this.students.save(student);
  }

  findAll(): Promise<Student[]> {
    return this.students.find({ order: { createdAt: 'ASC' } });
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.students.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException(`Student ${id} not found`);
    }
    return student;
  }

  async update(id: string, dto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);
    if (dto.fullName !== undefined) {
      student.fullName = dto.fullName;
    }
    if (dto.course !== undefined) {
      student.course = dto.course;
    }
    return this.students.save(student);
  }

  async transfer(id: string, dto: TransferStudentDto): Promise<Student> {
    const student = await this.findOne(id);
    if (student.status !== StudentStatus.ENROLLED) {
      throw new ConflictException('Only enrolled students can be transferred');
    }
    student.course = dto.course;
    return this.students.save(student);
  }

  async expel(id: string): Promise<Student> {
    const student = await this.findOne(id);
    if (student.status === StudentStatus.EXPELLED) {
      throw new ConflictException('Student is already expelled');
    }
    student.status = StudentStatus.EXPELLED;
    return this.students.save(student);
  }

  async sendOnAcademicLeave(id: string): Promise<Student> {
    const student = await this.findOne(id);
    if (student.status !== StudentStatus.ENROLLED) {
      throw new ConflictException('Only enrolled students can go on academic leave');
    }
    student.status = StudentStatus.ACADEMIC_LEAVE;
    return this.students.save(student);
  }

  async returnFromAcademicLeave(id: string): Promise<Student> {
    const student = await this.findOne(id);
    if (student.status !== StudentStatus.ACADEMIC_LEAVE) {
      throw new ConflictException('Student is not on academic leave');
    }
    student.status = StudentStatus.ENROLLED;
    return this.students.save(student);
  }
}
