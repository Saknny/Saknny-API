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

@Controller('beds')
export class BedController {
  constructor(private readonly bedService: BedService) {}

  @Post(':id/create')
  async createBed(
    @Param('id') roomId: string,
    @Body() createBedDto: CreateBedDto,
  ) {
    return this.bedService.createBed(roomId, createBedDto);
  }

  @Patch(':id/update')
  async updateBed(
    @Param('id') bedId: string,
    @Body() updateBedDto: UpdateBedDto,
  ) {
    return this.bedService.updateBed(bedId, updateBedDto);
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
