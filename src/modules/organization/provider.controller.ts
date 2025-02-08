import { Controller } from '@nestjs/common';
import { OrganizationService } from './provider.service';

@Controller('provider')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}
}
