import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthenticationGuard } from '../../libs/guards/strategy.guards/jwt.guard';
import { currentUser } from '../../libs/decorators/currentUser.decorator';
import { Serialize } from '../../libs/interceptors/serialize.interceptor';
import { UserIdResponse, UserResponse } from './dtos/responses/user.response';
import { currentUserType } from '../../libs/types/current-user.type';
import { CompleteUserProfileInput } from './dtos/inputs/update-user.input';
import { Transactional } from 'typeorm-transactional';
import { UserEmailInput } from './dtos/inputs/user-filter.input';
import { Auth } from '@src/libs/decorators/auth.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':email')
  @Serialize(UserIdResponse)
  async getUserIdByEmail(@Param() { email }: UserEmailInput) {
    return await this.userService.getVerifiedUserIdByEmail(email);
  }

  @Patch('onboarding')
  @Auth({ allow: 'authenticated' })
  @Serialize(UserResponse)
  @Transactional()
  async completeUserProfile(
    @currentUser() user: currentUserType,
    @Body() Input: CompleteUserProfileInput,
  ) {
    return await this.userService.completeUserProfile(user, Input);
  }

  @Delete()
  @Auth({ allow: 'authenticated' })
  async deleteCurrentUser(@currentUser() user: currentUserType) {
    return await this.userService.deleteCurrentUser(user);
  }

  //BUG: remember to delete this endpoint
  @Delete('/all')
  async deleteALLUser() {
    return await this.userService.deleteAllUser();
  }
}
