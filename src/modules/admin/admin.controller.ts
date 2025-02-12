import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { AdminService } from "./admin.service";




@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {
  }

  @Get('untrusted-providers')
  async getUntrustedProviders() {
    return this.adminService.getUntrustedProviders();
  }


  @Patch(':id/approveVendor')
  async approveOrRejectProvider(
    @Param('id') id: string,
    @Body('isTrusted') isTrusted: boolean
  ) {
    return this.adminService.updateProviderApproval(id, isTrusted);
  }

  @Get('untrusted-students')
  async getUntrustedStudent() {
    return this.adminService.getUntrustedStudents();
  }


  @Patch(':id/approveStudent')
  async approveOrRejectStudent(
    @Param('id') id: string,
    @Body('isTrusted') isTrusted: boolean
  ) {
    return this.adminService.updateStudentApproval(id, isTrusted);
  }
}