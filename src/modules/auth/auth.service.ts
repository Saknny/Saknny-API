import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { get } from 'env-var';
import * as jwt from 'jsonwebtoken';
import { BaseHttpException } from '../../libs/application/exceptions/base-http-exception';
import { ErrorCodeEnum } from '../../libs/application/exceptions/error-code.enum';
import { InjectBaseRepository } from '../../libs/decorators/inject-base-repository.decorator';
import { TokenPayload } from '../../libs/types/auth-token-payload.type';
import { BaseRepository } from '../../libs/types/base-repository';
import { HelperService } from '../../libs/utils/helper/helper.service';
import { Student } from '../student/entities/student.entity';
import { Provider } from '../provider/entities/provider.entity';
import { OtpUseCaseEnum } from '../otp/enums/otp.enum';
import { OtpService } from '../otp/otp.service';
import { Session } from '../session/entities/session.entity';
import { User } from '../user/entities/user.entity';
import { UserRoleEnum } from '../user/enums/user.enum';
import { UserTransformer } from '../user/transformer/user.transformer';
import { UserService } from '../user/user.service';
import { ResetPasswordInput } from './dtos/inputs/reset-password.input';
import { SignupInput } from './dtos/inputs/signup.input';
import { UpdateEmailInput } from './dtos/inputs/update-email.input';
import { UpdatePasswordInput } from './dtos/inputs/update-password.input';

@Injectable()
export class AuthService {
  constructor(
    private readonly otpService: OtpService,
    private readonly userService: UserService,
    private readonly helperService: HelperService,
    private readonly userTransformer: UserTransformer,
    @InjectBaseRepository(User)
    private readonly userRepo: BaseRepository<User>,
    @InjectBaseRepository(Student)
    private readonly studentRepo: BaseRepository<Student>,
    @InjectBaseRepository(Provider)
    private readonly providerRepo: BaseRepository<Provider>,
  ) { }

  async signup(input: SignupInput) {
    const { firstName, lastName, email, role } = input;
    await this.userService.errorIfUserExists(email);
    await this.userService.deleteDuplicatedUsersAtNotVerifiedEmail(email);

    const data = await this.userTransformer.registerAsUserTransformer(input);
    const user = await this.userRepo.createOne(data);

    if (role === UserRoleEnum.PROVIDER)
      await this.providerRepo.createOne({ user, lastName, firstName });

    if (role === UserRoleEnum.STUDENT)
      await this.studentRepo.createOne({ user, lastName, firstName });

    await this.otpService.sendOtp(user.id, OtpUseCaseEnum.VERIFY_ACCOUNT);
    return user;
  }

  async verifyAccount(userId: string, otp: string) {
    const user = await this.userRepo.findOneOrError(
      { id: userId },
      ErrorCodeEnum.NOT_FOUND,
    );

    await this.otpService.verifyOtpOrError(
      { otp, userId: user.id, useCase: OtpUseCaseEnum.VERIFY_ACCOUNT },
      true,
    );

    return await this.userRepo.updateOneFromExistingModel(user, {
      ...user,
      unVerifiedEmail: null,
      verifiedEmail: user.unVerifiedEmail,
    });
  }

  async forgetPassword(email: string) {
    const user = await this.userService.getLoginUserOrError({
      $or: [{ verifiedEmail: email }, { unVerifiedEmail: email }],
    });

    await this.otpService.sendOtp(user.id, OtpUseCaseEnum.RESET_PASSWORD);

    return user;
  }

  async validateUser(email: string, password: string, role?: UserRoleEnum) {
    const user = await this.userService.getLoginUserOrError({
      $or: [{ verifiedEmail: email }, { unVerifiedEmail: email }],
      role,
    });

    if (!user.password) throw new BaseHttpException(ErrorCodeEnum.NO_PASSWORD);

    await this.matchPassword(password, user.password);

    return user;
  }

  async resetPassword({ userId, otp, password }: ResetPasswordInput) {
    const user = await this.userRepo.findOneOrError(
      { id: userId },
      ErrorCodeEnum.NOT_FOUND,
    );

    await this.otpService.verifyOtpOrError(
      { otp, userId: user.id, useCase: OtpUseCaseEnum.RESET_PASSWORD },
      true,
    );

    return await this.userRepo.updateOneFromExistingModel(user, {
      ...user,
      password: await this.helperService.hashPassword(password),
    });
  }

  async appendAuthTokenToResponse(user: User, session: Session) {
    return {
      user,
      token: this.generateAuthToken({ userId: user.id, sessionId: session.id }),
    };
  }

  private async matchPassword(password: string, hash: string) {
    const isMatched = await bcrypt.compare(password, hash);
    if (!isMatched) {
      throw new BaseHttpException(ErrorCodeEnum.INVALID_EMAIL_OR_PASSWORD);
    }
  }

  private generateAuthToken(
    payload: TokenPayload,
    isTemporary = false,
  ): string {
    return jwt.sign(payload, get('JWT_SECRET').required().asString(), {
      algorithm: 'RS256',
      ...(isTemporary && { expiresIn: 30 * 60 }),
    });
  }

  async updateEmail(userId: string, input: UpdateEmailInput) {
    const { newEmail, otp } = input;

    const user = await this.userRepo.findOneOrError(
      { id: userId },
      ErrorCodeEnum.NOT_FOUND,
    );

    await this.otpService.verifyOtpOrError(
      { otp, userId: user.id, useCase: OtpUseCaseEnum.UPDATE_EMAIL },
      true,
    );

    await this.userService.errorIfUserExists(newEmail);

    return await this.userRepo.updateOneFromExistingModel(user, {
      ...user,
      unVerifiedEmail: newEmail,
    });
  }

  async updatePassword(userId: string, input: UpdatePasswordInput) {
    const { currentPassword, newPassword, otp } = input;

    const user = await this.userRepo.findOneOrError(
      { id: userId },
      ErrorCodeEnum.NOT_FOUND,
    );

    await this.otpService.verifyOtpOrError(
      { otp, userId: user.id, useCase: OtpUseCaseEnum.UPDATE_PASSWORD },
      true,
    );

    await this.matchPassword(currentPassword, user.password);

    return await this.userRepo.updateOneFromExistingModel(user, {
      ...user,
      password: await this.helperService.hashPassword(newPassword),
    });
  }
}
