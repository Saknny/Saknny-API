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
import { StudentOnlyGuard } from '@src/libs/guards/auth.guards/permission-guards/student.guard';
import { currentUser } from '@src/libs/decorators/currentUser.decorator';
import { currentUserType } from '@src/libs/types/current-user.type';
import { ReportService } from './report.service';
import { AddReportDto } from './dtos/addReport.dto';
import { ApartmentReviewsDto } from '../review/dtos/apartmentReviews.dto';
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}


    @Post('addReport')
    async addReport(
        @currentUser() { id }: currentUserType,
        @Body() dto: AddReportDto
    ){
        return this.reportService.createReport(id, dto);
    }

  @Get('apartmentReports')
  async getApartmentReview(
    @Body() dto :ApartmentReviewsDto
  ){
    return this.reportService.getApartmentReports(dto);
  }

  @Get('')
  async getReport(@Body() body){
    return this.reportService.getReport(body.id);
  }

  @Patch('unblock')
  async unblockApartment(@Body() body){
    return this.reportService.unblockApartment(body.apartmentId)
  }


}
