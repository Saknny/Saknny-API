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
    @UploadedFiles() files: { idCardImage?: Express.Multer.File[]; profilePicture?: Express.Multer.File[] },
    @Body() body: UpdateStudentInput
  ) {
    const idCardImagePath = files.idCardImage ? `/uploads/${files.idCardImage[0].filename}` : undefined;
    const profilePicturePath = files.profilePicture ? `/uploads/${files.profilePicture[0].filename}` : undefined;

    return await this.studentService.updateStudent(id, body, idCardImagePath, profilePicturePath);
  }



  @Patch('complete-profile')
  @UseInterceptors(fileUploadInterceptor())
  async completeProfile(
    @currentUser() { id }: currentUserType,
    @UploadedFiles()
    files: {
      idCardImage?: Express.Multer.File[];
      profilePicture?: Express.Multer.File[];
    },
    @Body() completeProfileDto: CompleteProfileDto,
  ) {

    const idCardImagePath = files.idCardImage ? `/uploads/${files.idCardImage[0].filename}` : undefined;
    const profilePicturePath = files.profilePicture ? `/uploads/${files.profilePicture[0].filename}` : undefined;

    const updatedStudent = await this.studentService.completeProfile(
      id,
      completeProfileDto,
      idCardImagePath,
      profilePicturePath,
    );

    return { message: 'Profile completed successfully!', student: updatedStudent };
  }

}