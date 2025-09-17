import {
  Body,
  Controller,
  Patch,
  UseInterceptors,
  UploadedFiles,
  Inject,
  forwardRef,
  Get,
  Param,
  BadRequestException,
  UploadedFile,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { currentUser } from '../../libs/decorators/currentUser.decorator';
import { UpdateStudentInput } from './dtos/inputs/update-student.input';
import { CompleteProfileDto } from './dtos/CompleteProfileDto.dto';
import { currentUserType } from '@src/libs/types/current-user.type';
import { imageUploadInterceptor } from './interceptors/image-upload.interceptor';
import { PendingRequestService } from '../request/pendingRequest.service';
import { EntityType } from '../request/entities/enum/entityType.enum';
import { Type } from '../request/entities/enum/type.enum';
import { cardUploadInterceptor } from './interceptors/card-upload.interceptor';
import { fileUploadInterceptor } from './interceptors/file-upload.interceptor';
import { ProfileCompleteEnum } from '../user/enums/profile-complete.enum';
import { UserService } from '../user/user.service';

@Controller('students')
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
    @Inject(forwardRef(() => PendingRequestService))
    private readonly pendingRequestService: PendingRequestService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) { }

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
    files = files || {};

    if (!files.idCard || files.idCard.length === 0) {
      throw new BadRequestException('ID Card is required');
    }
    // Process idCard (stored in memory)
  if (files.idCard?.[0]?.buffer) {
    completeProfileDto.idCard = files.idCard[0].buffer.toString('base64');
  }

  // Process image (stored in disk)
  if (files.image?.[0]?.filename) {
    completeProfileDto.image = `/uploads/${files.image[0].filename}`;
  }

  // Update profile status via UserService (not directly via repository)
    await this.userService.updateProfileCompleteStatus(
      id,
      ProfileCompleteEnum.PENDING,
    );
    return await this.pendingRequestService.CreateProfileRequest(
      id,
      EntityType.STUDENT,
      completeProfileDto,
      Type.PROFILE_COMPLETE,
    );

  }

  @Get('profile')
  async getProfile(
  @currentUser() { id }: currentUserType) {
    console.log(id)
    return await this.studentService.getStudentProfile(id);
  }

  @Patch('update-profile')
  @UseInterceptors(imageUploadInterceptor())
  async updateStudent(
    @currentUser() { id }: currentUserType,
    @UploadedFile() image: Express.Multer.File,
    @Body() body: UpdateStudentInput,
  ) {

    if (image) {
      body.image = `/uploads/${image.filename}`;
    }

    return await this.studentService.updateStudent(id, body);
  }


  @Patch('update-idCard')
  @UseInterceptors(cardUploadInterceptor())
  async updateIdCard(
    @currentUser() { id }: currentUserType,
    @UploadedFile() idCard?: Express.Multer.File) {

    if (!idCard) {
      throw new BadRequestException('ID Card is required');
    }
    if (Buffer.isBuffer(idCard.buffer)) {
      const idCardBase64 = idCard.buffer.toString('base64');
      return await this.pendingRequestService.UpdateCardRequest(id, idCardBase64, EntityType.STUDENT);
    }


  }
  @Get(':studentId')
  async getStudent(@Param('studentId') studentId: string) {
    return await this.studentService.getStudent(studentId);
  }

  @Get(':studentId/board')
  async getStudentBoard(@Param('studentId') studentId: string) {
    return await this.studentService.getStudentBoard(studentId);
  }


}
