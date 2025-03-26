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
import { CompleteUserProfileInput, UpdateUserInfo } from './dtos/inputs/update-user.input';
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

  @Get()
  async getAllUsers(){
    return this.userService.getAllUsers();
  }
  @Get(":id")
  async getUser(@Param("id") id :string){
    return this.userService.getUserById(id);
  }

  @Patch(":id")
  async updateUser(@Param("id") id :string , @Body() user : UpdateUserInfo){
    return this.userService.updateUser(id , user);
  }

  @Delete(":id")
  async deleteUser(@Param("id") id :string){
  return this.userService.deleteUser(id)
  }


}
