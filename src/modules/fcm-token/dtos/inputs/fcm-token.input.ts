import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DeviceEnum } from '../../../individual/enums/individual.enum';

export class FCMTokenInput {
  @IsString()
  @IsNotEmpty()
  fcmTokenString: string;

  @IsEnum(DeviceEnum)
  @IsNotEmpty()
  deviceType: DeviceEnum;
}
