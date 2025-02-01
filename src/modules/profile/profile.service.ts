import { Injectable } from '@nestjs/common';
import { InjectBaseRepository } from '../../libs/decorators/inject-base-repository.decorator';
import { Profile } from './entities/profile.entity';
import { BaseRepository } from '../../libs/types/base-repository';
import { ErrorCodeEnum } from '../../libs/application/exceptions/error-code.enum';
import { CreateProfileInput } from './dtos/inputs/create-profile.input';
import { UpdateProfileInput } from './dtos/inputs/update-profile.input';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectBaseRepository(Profile)
    private readonly profileRepo: BaseRepository<Profile>,
  ) {}

  async create(profileData: CreateProfileInput & { user: User }) {
    const profile = this.profileRepo.create(profileData);
    return this.profileRepo.save(profile);
  }

  async findAll() {
    return this.profileRepo.find();
  }

  async findOne(id: number) {
    return this.profileRepo.findOneOrError(
      { id },
      ErrorCodeEnum.FILE_NOT_FOUND,
    );
  }

  async update(id: number, profileData: UpdateProfileInput) {
    const profile = await this.profileRepo.findOneOrError(
      { id },
      ErrorCodeEnum.FILE_NOT_FOUND,
    );
    return this.profileRepo.save({ ...profile, ...profileData });
  }

  async remove(id: number) {
    const profile = await this.profileRepo.findOneOrError(
      { id },
      ErrorCodeEnum.PROFILE_NOT_FOUND,
    );
    await this.profileRepo.delete({ id: profile.id });
  }

  async findProfileByUserId(userId: string) {
    return this.profileRepo.findOneOrError(
      { user: { id: userId } },
      ErrorCodeEnum.PROFILE_NOT_FOUND,
    );
  }
}