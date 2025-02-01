import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UseGuards,
  } from '@nestjs/common';
  import { ProfileService } from './profile.service';
  import { CreateProfileInput } from '../profile/dtos/inputs/create-profile.input';
  import { UpdateProfileInput } from '../profile/dtos/inputs/update-profile.input';
  import { JwtAuthenticationGuard } from '../../libs/guards/strategy.guards/jwt.guard';
  import { currentUser } from '../../libs/decorators/currentUser.decorator';
  import { currentUserType } from '../../libs/types/current-user.type';
  
  @Controller('profiles')
  export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}
  
    @Post()
    @UseGuards(JwtAuthenticationGuard)
    async createProfile(
      @currentUser() user: currentUserType,
      @Body() profileData: CreateProfileInput,
    ) {
      return this.profileService.create({ ...profileData, user });
    }
  
    @Get()
    async findAllProfiles() {
      return this.profileService.findAll();
    }
  
    @Get(':id')
    async findProfileById(@Param('id') id: number) {
      return this.profileService.findOne(id);
    }
  
    @Put(':id')
    @UseGuards(JwtAuthenticationGuard)
    async updateProfile(
      @Param('id') id: number,
      @Body() profileData: UpdateProfileInput,
    ) {
      return this.profileService.update(id, profileData);
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthenticationGuard)
    async deleteProfile(@Param('id') id: number) {
      return this.profileService.remove(id);
    }
  }