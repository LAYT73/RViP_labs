import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateStudentDto } from './dto/create-student.dto';
import { TransferStudentDto } from './dto/transfer-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './student.entity';
import { StudentsService } from './students.service';

@ApiTags('students')
@Controller('api/students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @ApiOperation({ summary: 'Accept (enroll) a student' })
  enroll(@Body() dto: CreateStudentDto): Promise<Student> {
    return this.studentsService.enroll(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List students' })
  findAll(): Promise<Student[]> {
    return this.studentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student by id' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Student> {
    return this.studentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Edit student' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentDto,
  ): Promise<Student> {
    return this.studentsService.update(id, dto);
  }

  @Post(':id/transfer')
  @ApiOperation({ summary: 'Transfer student to another course' })
  transfer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransferStudentDto,
  ): Promise<Student> {
    return this.studentsService.transfer(id, dto);
  }

  @Post(':id/expel')
  @ApiOperation({ summary: 'Expel student' })
  expel(@Param('id', ParseUUIDPipe) id: string): Promise<Student> {
    return this.studentsService.expel(id);
  }

  @Post(':id/academic-leave')
  @ApiOperation({ summary: 'Send enrolled student on academic leave' })
  sendOnAcademicLeave(@Param('id', ParseUUIDPipe) id: string): Promise<Student> {
    return this.studentsService.sendOnAcademicLeave(id);
  }

  @Post(':id/return-from-academic-leave')
  @ApiOperation({ summary: 'Return student from academic leave to enrolled' })
  returnFromAcademicLeave(@Param('id', ParseUUIDPipe) id: string): Promise<Student> {
    return this.studentsService.returnFromAcademicLeave(id);
  }
}
