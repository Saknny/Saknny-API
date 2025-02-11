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

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':email')
  @Serialize(UserIdResponse)
  async getUserIdByEmail(@Param() { email }: UserEmailInput) {
    return await this.userService.getVerifiedUserIdByEmail(email);
  }

  @Patch('onboarding')
  @UseGuards(JwtAuthenticationGuard)
  @Serialize(UserResponse)
  @Transactional()
  async completeUserProfile(
    @currentUser() user: currentUserType,
    @Body() Input: CompleteUserProfileInput,
  ) {
    return await this.userService.completeUserProfile(user, Input);
  }

  @Delete()
  @UseGuards(JwtAuthenticationGuard)
  async deleteCurrentUser(@currentUser() user: currentUserType) {
    return await this.userService.deleteCurrentUser(user);
  }


}
