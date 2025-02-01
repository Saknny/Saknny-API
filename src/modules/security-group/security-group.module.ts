import { Module } from '@nestjs/common';
import { SecurityGroupService } from './security-group.service';
import { SecurityGroupController } from './security-group.controller';

@Module({
  controllers: [SecurityGroupController],
  providers: [SecurityGroupService],
})
export class SecurityGroupModule {}
