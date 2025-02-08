import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { PaginatorInput } from '../../libs/application/paginator/paginator.input';
import { PaginatorResponse } from '../../libs/application/paginator/paginator.response';
import { StudentWithIdResponse } from './dtos/responses/student.response';
import { Auth } from '../../libs/decorators/auth.decorator';
import { Serialize } from '../../libs/interceptors/serialize.interceptor';
import {
  FilterStudentsInput,
  StudentIdInput,
} from './dtos/inputs/filter-student.input';
import { JwtAuthenticationGuard } from '../../libs/guards/strategy.guards/jwt.guard';
import { currentUser } from '../../libs/decorators/currentUser.decorator';
import { User } from '../user/entities/user.entity';
import { UpdateStudentInput } from './dtos/inputs/update-student.input';

@Controller('students')
@UseGuards(JwtAuthenticationGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @Auth({ allow: 'provider' })
  @Serialize(PaginatorResponse, StudentWithIdResponse)
  async geStudents(
    @Query('filter') jobStudentInput: FilterStudentsInput,
    @Query('paginate') paginate: PaginatorInput,
  ) {
    if (!paginate) paginate = { page: 1, limit: 15 };
    // return await this.studentService.searchStudents(jobStudentInput, paginate);
  }

  @Get('/:studentId')
  @Auth({ allow: 'provider' })
  @Serialize(StudentWithIdResponse)
  async getStudent(@Param() { studentId }: StudentIdInput) {
    // return await this.studentService.getStudent(studentId);
  }

  @Patch('/me')
  @Auth({ allow: 'student' })
  @Serialize(StudentWithIdResponse)
  async updateStudent(
    @currentUser() user: User,
    @Body() body: UpdateStudentInput,
  ) {
    // return await this.studentService.updateStudent(user, body);
  }
}
