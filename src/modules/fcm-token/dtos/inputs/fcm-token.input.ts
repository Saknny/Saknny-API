import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DeviceEnum } from '@src/modules/individual/enums/student.enum';

export class FCMTokenInput {
  @IsString()
  @IsNotEmpty()
  fcmTokenString: string;

  @IsEnum(DeviceEnum)
  @IsNotEmpty()
  deviceType: DeviceEnum;
}
