import {
  Controller,
  Post,
  Param,
  UploadedFiles,
  UseInterceptors,
  Patch,
  UploadedFile,
  NotFoundException,
  Delete,
  Body,
  forwardRef,
  Inject,
  Get,
  UseGuards,
} from '@nestjs/common';

import { PendingRequestService } from '../request/pendingRequest.service';
import { ReviewService } from './review.service';
import { AddReviewDto } from './dtos/addReview.dto';
import { StudentOnlyGuard } from '@src/libs/guards/auth.guards/permission-guards/student.guard';
import { currentUser } from '@src/libs/decorators/currentUser.decorator';
import { currentUserType } from '@src/libs/types/current-user.type';
import { ApartmentReviewsDto } from './dtos/apartmentReviews.dto';
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('addReview')
    async addReview(
    @currentUser() { id }: currentUserType,
    @Body() dto: AddReviewDto
    ) {
        return this.reviewService.createReview(id, dto);
    }

    @Post('addReport')
    async addReport(
        @currentUser() { id }: currentUserType,
        @Body() dto: AddReviewDto
    ){
        return this.reviewService.createReport(id, dto);
    }

  @Get('apartmentReviews')
  async getApartmentReview(
    @Body() dto :ApartmentReviewsDto
  ){
    return this.reviewService.getApartmentReviews(dto);
  }


}
