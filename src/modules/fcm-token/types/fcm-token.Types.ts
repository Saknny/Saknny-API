import { IsEnum, IsString } from 'class-validator';
import { DeviceEnum } from '@src/modules/student/enums/student.enum';

export class FCMTokenInput {
  @IsString()
  fcmTokenString: string;

  @IsEnum(DeviceEnum)
  deviceType: DeviceEnum;
}
