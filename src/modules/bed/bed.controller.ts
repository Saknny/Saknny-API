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
} from '@nestjs/common';

import { BedService } from './bed.service';

import { CreateBedDto } from './dto/create-bed.dto/create-bed.dto';
import { UpdateBedDto } from './dto/update-bed.dto/update-bed.dto';
import { PendingRequestService } from '../request/pendingRequest.service';

@Controller('beds')
export class BedController {
  constructor(private readonly bedService: BedService,
    @Inject(forwardRef(() => PendingRequestService))
    private readonly pendingRequestService: PendingRequestService,) { }

  @Post(':id/:roomRecordId/create')
  async createBed(
    @Param('id') apartmentRequestId: string,
    @Param('roomRecordId') roomRecordId: string,
    @Body() createBedDto: CreateBedDto,
  ) {

    return this.pendingRequestService.addBedRequest(apartmentRequestId, roomRecordId, createBedDto);
  }


  @Patch(':id/updateInfo')
  async updateBedInfo(
    @Param('id') bedId: string,
    @Body() updateBedDto: UpdateBedDto,
  ) {
    return this.bedService.updateBed(bedId, updateBedDto);
  }


  @Post(':id/:requestId/updateRequest')
  async updateBedRequest(
    @Param('id') bedId: string,
    @Param('requestId') requestId: string,
  ) {
    return this.pendingRequestService.updateBedRequest(bedId, requestId);
  }

  @Delete(':id/delete')
  async deleteBed(@Param('id') BedId: string) {
    return this.bedService.deleteBed(BedId);
  }

  @Get(':id')
  async getBed(@Param('id') id: string) {
    return this.bedService.getBed(id);
  }

  @Get(':id/board')
  async getBedBoard(@Param('id') id: string) {
    return this.bedService.getBedBoard(id);
  }
}
