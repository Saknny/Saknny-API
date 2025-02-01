import { PartialType } from '@nestjs/mapped-types';
import { CreateSecurityGroupDto } from './create-security-group.dto';

export class UpdateSecurityGroupDto extends PartialType(CreateSecurityGroupDto) {}
