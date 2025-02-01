import { Config } from '@src/configs/app/system.config';
import { UploaderS3ConfigType } from '@src/libs/types/system.config';

export const S3_CONFIG = 's3.config';
export const S3_SERVICE = 's3.service';
export const PREFIX_ALGORITHM = 'prefix.algorithm';
export const DEFAULT_EXPIRES_IN = (<UploaderS3ConfigType>(<unknown>Config.uploaderPlugin)).urlExpiration;
