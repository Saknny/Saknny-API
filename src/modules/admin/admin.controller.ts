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


  @Patch(':id/approve')
  async approveOrRejectProvider(
    @Param('id') id: string,
    @Body('isTrusted') isTrusted: boolean
  ) {
    return this.adminService.updateProviderApproval(id, isTrusted);
  }
}