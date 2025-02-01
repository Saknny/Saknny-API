import { IsEnum, IsString } from 'class-validator';
import { DeviceEnum } from '../../individual/enums/individual.enum';

export class FCMTokenInput {
  @IsString()
  fcmTokenString: string;

  @IsEnum(DeviceEnum)
  deviceType: DeviceEnum;
}
