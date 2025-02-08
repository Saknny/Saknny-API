import { IsEnum, IsString } from 'class-validator';
import { DeviceEnum } from '@src/modules/individual/enums/student.enum';

export class FCMTokenInput {
  @IsString()
  fcmTokenString: string;

  @IsEnum(DeviceEnum)
  deviceType: DeviceEnum;
}
