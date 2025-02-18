import {
  Body,
  Controller,
  Patch,
  UseInterceptors,
  UploadedFiles,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { currentUser } from '../../libs/decorators/currentUser.decorator';
import { UpdateStudentInput } from './dtos/inputs/update-student.input';
import { CompleteProfileDto } from './dtos/CompleteProfileDto.dto';
import { currentUserType } from '@src/libs/types/current-user.type';
import { fileUploadInterceptor } from './interceptors/file-upload.interceptor';
import { PendingRequestService } from '../request/pendingRequest.service';
import { EntityType } from '../request/entities/enum/entityType.enum';
import { Type } from '../request/entities/enum/type.enum';


@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService,
    @Inject(forwardRef(() => PendingRequestService))
    private readonly pendingRequestService: PendingRequestService
  ) { }

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

    return await this.pendingRequestService.submitProfileUpdate(id, EntityType.STUDENT, body, Type.PROFILE_UPDATE)
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

    return await this.pendingRequestService.submitProfileUpdate(id, EntityType.STUDENT, completeProfileDto, Type.PROFILE_COMPLETE)

  }

}