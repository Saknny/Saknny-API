import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
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
import { CompleteProfileDto } from './dtos/CompleteProfileDto.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express'
@Controller('students')

@Auth({ allow: 'authenticated' })

export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  // @Get()
  // @Auth({ allow: 'provider' })
  // @Serialize(PaginatorResponse, StudentWithIdResponse)
  // async geStudents(
  //   @Query('filter') jobStudentInput: FilterStudentsInput,
  //   @Query('paginate') paginate: PaginatorInput,
  // ) {
  //   if (!paginate) paginate = { page: 1, limit: 15 };
  //   // return await this.studentService.searchStudents(jobStudentInput, paginate);
  // }

  // @Get('/:studentId')
  // @Auth({ allow: 'provider' })
  // @Serialize(StudentWithIdResponse)
  // async getStudent(@Param() { studentId }: StudentIdInput) {
  //   // return await this.studentService.getStudent(studentId);
  // }

  @Patch('/:id/me')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'idCardImage', maxCount: 1 },
        { name: 'profilePicture', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads', // Save files in the "uploads" folder
          filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            callback(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
          },
        }),
      },
    ),
  )
  async updateStudent(
    @currentUser() user: User,
    @Body() body: UpdateStudentInput,
  ) {
    // return await this.studentService.updateStudent(user, body);
  }
  
  
 

  @Patch('/complete-profile/:id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'idCardImage', maxCount: 1 },
        { name: 'profilePicture', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads', // 📂 Save files in 'uploads' folder
          filename: (req, file, callback) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            callback(
              null,
              file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
            );
          },
        }),
      },
    ),
  )
  async completeProfile(
    @Req() request: Request,
    @Param('id') id: string, // 🔹 Take ID as a parameter
    @UploadedFiles()
    files: {
      idCardImage?: Express.Multer.File[];
      profilePicture?: Express.Multer.File[];
    },
    @Body() completeProfileDto: CompleteProfileDto,
  ) {
    console.log('Headers:', request.headers);
    console.log('Student ID:', id); // 🔹 Log the provided ID

    const idCardImagePath = files.idCardImage
      ? `/uploads/${files.idCardImage[0].filename}`
      : undefined;
    const profilePicturePath = files.profilePicture
      ? `/uploads/${files.profilePicture[0].filename}`
      : undefined;

    const updatedStudent = await this.studentService.completeProfile(
      id,
      completeProfileDto,
      idCardImagePath,
      profilePicturePath,
    );

    return {
      message: 'Profile completed successfully!',
      student: updatedStudent,
    };
  }

}

