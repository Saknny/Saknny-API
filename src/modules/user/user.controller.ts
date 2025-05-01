import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  UseGuards,
  NotFoundException,
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
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.getUserWithDetailsById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
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
  async getAllUsers() {
    const users = await this.userService.getAllUsersWithDetails();
    return users.map(user => ({
      id: user.id,
      email: user.verifiedEmail,
      role: user.role,
      isBlocked: user.isBlocked,
      favLang: user.favLang,
      lastSeenAt: user.lastSeenAt,
      student: user.student ?? null,
      provider: user.provider ?? null,
    }));
  }



  @Patch(":id")
  async updateUser(@Param("id") id :string , @Body() user : UpdateUserInfo){
    return this.userService.updateUser(id , user);
  }


  @Delete(':id')
async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
  await this.userService.deleteUserById(id);
  return { message: 'User and related entity deleted successfully.' };
}

  


}
