import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SecurityGroupService } from './security-group.service';

@Controller('security-group')
export class SecurityGroupController {
  constructor(private readonly securityGroupService: SecurityGroupService) {}
}
