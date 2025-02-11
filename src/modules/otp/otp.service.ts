import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { OtpUseCaseEnum } from './enums/otp.enum';
import { Otp } from './entities/otp.entity';
import { InjectBaseRepository } from '../../libs/decorators/inject-base-repository.decorator';
import { BaseRepository } from '../../libs/types/base-repository';
import { User } from '../user/entities/user.entity';
import { MoreThan } from 'typeorm';
import { get } from 'env-var';
import { ErrorCodeEnum } from '../../libs/application/exceptions/error-code.enum';
import { BaseHttpException } from '../../libs/application/exceptions/base-http-exception';
import { MailService } from '../../libs/mail/mail.service';
import { UserVerificationCodeUseCaseEnum } from '../user/enums/user.enum';
import { defaultSubject } from '../../libs/mail/mail.type';
import { VerifyOtpInput } from './dtos/inputs/verify-otp.input';
import { env } from 'process';

@Injectable()
export class OtpService {
  private readonly otpExpiryMinutes =
    parseInt(get('OTP_EXPIRY_MIN').asString(), 10) || 10;
  private readonly saltRounds = 10;

  constructor(
    @InjectBaseRepository(Otp)
    private readonly otpRepo: BaseRepository<Otp>,
    @InjectBaseRepository(User)
    private readonly userRepo: BaseRepository<User>,
    private readonly mailService: MailService,
  ) {}

  async createOtp(user: User, otpUseCase: OtpUseCaseEnum): Promise<string> {
    console.log(env.NODE_ENV);

    const randomOtp =
      env.NODE_ENV === 'developement'
        ? '1234'
        : Math.floor(1000 + Math.random() * 9000).toString();
    console.log(randomOtp);

    const hashedOtp = await bcrypt.hash(randomOtp, this.saltRounds);
    const expiresAt = new Date(Date.now() + this.otpExpiryMinutes * 60000);

    await this.otpRepo.createOne({
      otp: hashedOtp,
      user,
      expiresAt,
      useCase: otpUseCase,
    });
    return randomOtp;
  }

  async verifyOtpOrError(verifyOtpInput: VerifyOtpInput, shouldDelete = false) {
    const { userId, otp, useCase } = verifyOtpInput;
    const storedOtp = await this.otpRepo.findOne({
      userId,
      useCase,
      expiresAt: MoreThan(new Date(Date.now())),
    });

    if (!storedOtp || !(await bcrypt.compare(otp, storedOtp.otp)))
      throw new BaseHttpException(ErrorCodeEnum.INVALID_OTP);

    if (shouldDelete) await this.otpRepo.deleteAll({ userId });
    return { id: userId };
  }

  async sendOtp(userId: string, useCase: OtpUseCaseEnum): Promise<boolean> {
    const user = await this.userRepo.findOneOrError(
      { id: userId },
      ErrorCodeEnum.NOT_FOUND,
    );

    const otp = await this.createOtp(user, useCase);

    const recipientEmail = user.unVerifiedEmail || user.verifiedEmail;

    const useCaseMapping = {
      [OtpUseCaseEnum.RESET_PASSWORD]:
        UserVerificationCodeUseCaseEnum.PASSWORD_RESET,
      [OtpUseCaseEnum.VERIFY_ACCOUNT]:
        UserVerificationCodeUseCaseEnum.ACCOUNT_VERIFICATION,
    };

    const template = useCaseMapping[useCase];

    await this.mailService.send({
      to: recipientEmail,
      subject: defaultSubject[template],
      mjml: { verificationCode: otp, template },
    });

    return true;
  }
}
