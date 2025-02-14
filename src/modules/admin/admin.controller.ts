import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { ProviderService } from "../provider/provider.service";
import { StudentService } from "../student/student.service";
import { ApartmentService } from "../apartment/apartment.service";




@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService,
    private readonly providerService: ProviderService,
    private readonly studentService: StudentService,
    private readonly apartmentService: ApartmentService,
  ) {
  }
  // List All Un-Reviewed 
  @Get('unReviewed-providers')
  async getUnReviewedProviders() {
    return this.providerService.getUnReviewedProviders();
  }

  // Get A Specific Provider
  @Get(':id/provider')
  async getProvider(@Param('id') id: string) {
    return this.providerService.getById(id);
  }

  // Approve Or Reject Provider
  @Patch(':id/approveVendor')
  async approveOrRejectProvider(
    @Param('id') id: string,
    @Body('isTrusted') isTrusted: boolean
  ) {
    return this.providerService.updateProviderApproval(id, isTrusted);
  }


  @Get('unReviewed-students')
  async getUnReviewedStudents() {
    return this.studentService.getUnReviewedStudents();
  }

  @Get(':id/student')
  async getStudent(@Param('id') id: string) {
    return this.studentService.getById(id);
  }

  @Patch(':id/approveStudent')
  async approveOrRejectStudent(
    @Param('id') id: string,
    @Body('isTrusted') isTrusted: boolean
  ) {
    return this.studentService.updateStudentApproval(id, isTrusted);
  }

  @Get('unReviewed-apartments')
  async getUnReviewedApartments() {
    return this.apartmentService.getUnReviewedApartments();
  }

  @Get(':id/apartment')
  async getApartment(@Param('id') id: string) {
    return this.apartmentService.getById(id);
  }

  @Patch(':id/approveApartment')
  async approveOrRejectApartment(
    @Param('id') id: string,
    @Body('isTrusted') isTrusted: boolean
  ) {
    return this.apartmentService.updateApartmentApproval(id, isTrusted);
  }
}