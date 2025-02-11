import { Injectable } from '@nestjs/common';
import { InjectBaseRepository } from '../../libs/decorators/inject-base-repository.decorator';
import { User } from './entities/user.entity';
import { BaseRepository, WhereOptions } from '../../libs/types/base-repository';
import { FindOptionsWhere } from 'typeorm';
import { ErrorCodeEnum } from '../../libs/application/exceptions/error-code.enum';
import { BaseHttpException } from '../../libs/application/exceptions/base-http-exception';
import { CompleteUserProfileInput } from './dtos/inputs/update-user.input';
import { Student } from '../individual/entities/student.entity';
import { Provider } from '../organization/entities/provider.entity';
import { UserTransformer } from './transformer/user.transformer';
import { UserRoleEnum } from './enums/user.enum';

@Injectable()
export class UserService {
  constructor(
    private readonly userTransformer: UserTransformer,
    @InjectBaseRepository(User)
    private readonly userRepo: BaseRepository<User>,
    @InjectBaseRepository(Provider)
    private readonly orgRepo: BaseRepository<Provider>,
    @InjectBaseRepository(Student)
    private readonly studentRepo: BaseRepository<Student>,
  ) { }

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
      [UserRoleEnum.PROVIDER]: this.orgRepo,
      [UserRoleEnum.STUDENT]: this.studentRepo,
    };
    const repository = repositoryMap[role];

    if (profile && repository) {
      const updatedProfile = await repository.updateOneFromExistingModel(
        profile,
        data,
      );

      if (role === UserRoleEnum.STUDENT) {
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
