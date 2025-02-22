import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { ProviderService } from "../provider/provider.service";
import { StudentService } from "../student/student.service";
import { ApartmentService } from "../apartment/apartment.service";
import { PendingRequestService } from "../request/pendingRequest.service";
import { ImageApprovalDto } from "../request/dto/image-approval.dto";
import { RequestApprovalDto } from "../request/dto/RequestApproval.dto";




@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService,

    private readonly pendingRequestService: PendingRequestService,
  ) {
  }



  








  @Get('pending-requests')
  async getPendingRequests() {
    return await this.pendingRequestService.getPendingRequests();
  }

  @Patch(':id/request-approval')
  async requestApproval(@Param('id') id: string, @Body() body: RequestApprovalDto) {
    console.log(body.status);
    return await this.pendingRequestService.updateRequestApproval(id, body);
  }

  @Patch(':id/image-approval')
  async imageApproval(@Param('id') id: string, @Body() body: ImageApprovalDto) {
    return await this.pendingRequestService.updateImageApproval(id, body);
  }

           

}