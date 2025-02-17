import {
  Body,
  Controller,
  Patch,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { currentUser } from '../../libs/decorators/currentUser.decorator';
import { UpdateStudentInput } from './dtos/inputs/update-student.input';
import { CompleteProfileDto } from './dtos/CompleteProfileDto.dto';
import { currentUserType } from '@src/libs/types/current-user.type';
import { fileUploadInterceptor } from './interceptors/file-upload.interceptor';


@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) { }

  @Patch('me')
  @UseInterceptors(fileUploadInterceptor())
  async updateStudent(
    @currentUser() { id }: currentUserType,
    @UploadedFiles() files: { idCard?: Express.Multer.File[]; image?: Express.Multer.File[] },
    @Body() body: UpdateStudentInput
  ) {
    if (files.idCard && files.idCard.length > 0) {
      body.idCard = files.idCard[0].buffer.toString('base64');
    }
    if (files.image && files.image.length > 0) {
      body.image = `/uploads/${files.image[0].filename}`;
    }


    // return await this.studentService.updateStudent(id, body);
  }



  @Patch('complete-profile')
  @UseInterceptors(fileUploadInterceptor())
  async completeProfile(
    @currentUser() { id }: currentUserType,
    @UploadedFiles()
    files: {
      idCard?: Express.Multer.File[];
      image?: Express.Multer.File[];
    },
    @Body() completeProfileDto: CompleteProfileDto,
  ) {


    completeProfileDto.idCard = files.idCard[0].buffer.toString('base64');
    completeProfileDto.image = files.image ? `/uploads/${files.image[0].filename}` : undefined;

    // const updatedStudent = await this.studentService.completeProfile(
    //   id,
    //   completeProfileDto,
    // );

    // return { message: 'Profile completed successfully!', student: updatedStudent };
  }

}