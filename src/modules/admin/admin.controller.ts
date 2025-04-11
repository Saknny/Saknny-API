import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ProviderService } from '../provider/provider.service';
import { StudentService } from '../student/student.service';
import { ApartmentService } from '../apartment/apartment.service';
import { PendingRequestService } from '../request/pendingRequest.service';
import { ImageApprovalDto } from '../request/dto/image-approval.dto';
import { RequestDto } from '../request/dto/Request.dto';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,

    private readonly pendingRequestService: PendingRequestService,
  ) { }

  @Get('request/:id')
  async getRequest(@Param('id') id: string) {
    return await this.pendingRequestService.getRequest(id);
  }

  @Get('item/:id')
  async getItem(@Param('id') id: string) {
    return await this.pendingRequestService.getItem(id);
  }



  @Get('pending-requests')
  async getPendingRequests() {
    return await this.pendingRequestService.getPendingRequests();
  }





  @Patch('request-approval')
  async requestApproval(@Body() body: RequestDto) {
    return await this.pendingRequestService.updateRequestApproval(body);
  }

  @Patch('item-approval')
  async itemApproval(@Body() body: RequestDto) {
    return await this.pendingRequestService.updateItemApproval(body);
  }

  @Patch(':id/image-approval')
  async imageApproval(@Param('id') id: string, @Body() body: ImageApprovalDto) {
    return await this.pendingRequestService.updateImageApproval(id, body);
  }
}
