import { Injectable } from '@nestjs/common';

@Injectable()
export class SecurityGroupService {
  create(createSecurityGroupDto) {
    return 'This action adds a new securityGroup';
  }

  findAll() {
    return `This action returns all securityGroup`;
  }

  findOne(id: number) {
    return `This action returns a #${id} securityGroup`;
  }

  update(id: number, updateSecurityGroupDto) {
    return `This action updates a #${id} securityGroup`;
  }

  remove(id: number) {
    return `This action removes a #${id} securityGroup`;
  }
}
