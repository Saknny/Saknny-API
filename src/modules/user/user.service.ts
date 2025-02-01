import { Injectable } from '@nestjs/common';
import { InjectBaseRepository } from '../../libs/decorators/inject-base-repository.decorator';
import { User } from './entities/user.entity';
import { BaseRepository, WhereOptions } from '../../libs/types/base-repository';
import { FindOptionsWhere } from 'typeorm';
import { ErrorCodeEnum } from '../../libs/application/exceptions/error-code.enum';
import { BaseHttpException } from '../../libs/application/exceptions/base-http-exception';
import { CompleteUserProfileInput } from './dtos/inputs/update-user.input';
import { Individual } from '../individual/entities/individual.entity';
import { Organization } from '../organization/entities/organization.entity';
import { UserTransformer } from './transformer/user.transformer';
import { UserRoleEnum } from './enums/user.enum';
import { IndividualTransformer } from '../individual/transformer/individual.transformer';

@Injectable()
export class UserService {
  constructor(
    private readonly individualTransformer: IndividualTransformer,
    private readonly userTransformer: UserTransformer,
    @InjectBaseRepository(User)
    private readonly userRepo: BaseRepository<User>,
    @InjectBaseRepository(Organization)
    private readonly orgRepo: BaseRepository<Organization>,
    @InjectBaseRepository(Individual)
    private readonly individualRepo: BaseRepository<Individual>,
  ) {}

  async getVerifiedUserIdByEmail(email: string) {
    const user = await this.userRepo.findOneOrError(
      { verifiedEmail: email },
      ErrorCodeEnum.NOT_FOUND,
    );
    return { id: user.id };
  }

  async getLoginUserOrError(
    filter: FindOptionsWhere<User>[] | WhereOptions<User>,
  ) {
    const user = await this.userRepo.findOneOrError(
      filter,
      ErrorCodeEnum.INVALID_EMAIL_OR_PASSWORD,
      { securityGroup: true },
    );
    if (user.isBlocked) throw new BaseHttpException(ErrorCodeEnum.BLOCKED_USER);
    return user;
  }

  async completeUserProfile(user: User, input: CompleteUserProfileInput) {
    const { id, role } = user;

    const profile = user[role.toLowerCase()];

    if (profile.onboardingCompleted)
      throw new BaseHttpException(ErrorCodeEnum.ONBOARDING_ALREADY_COMPLETED);

    const data = this.userTransformer.validateOnboardingDataByRole(role, input);

    const repositoryMap = {
      [UserRoleEnum.ORGANIZATION]: this.orgRepo,
      [UserRoleEnum.INDIVIDUAL]: this.individualRepo,
    };
    const repository = repositoryMap[role];

    if (profile && repository) {
      const updatedProfile = await repository.updateOneFromExistingModel(
        profile,
        data,
      );

      if (role === UserRoleEnum.INDIVIDUAL) {
        await this.individualTransformer.createIndividualSpecialty(
          updatedProfile,
          input.individualProfile.specialtyInfo,
        );
      }
    }

    return this.userRepo.findOne({ id });
  }

  async deleteCurrentUser(user: User): Promise<void> {
    await this.userRepo.delete({ id: user.id });
  }

  async errorIfUserExists(email: string) {
    const user = await this.userRepo.findOne({ verifiedEmail: email });
    if (user) throw new BaseHttpException(ErrorCodeEnum.EMAIL_ALREADY_EXISTS);
  }

  async deleteDuplicatedUsersAtNotVerifiedEmail(duplicatedEmail: string) {
    await this.userRepo.deleteAll({
      unVerifiedEmail: duplicatedEmail,
      verifiedEmail: null,
    });
  }

  async deleteAllUser() {
    await this.userRepo.deleteAll({});
  }
}
