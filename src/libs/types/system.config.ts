import { UserRoleEnum } from '../../modules/user/enums/user.enum';
import { get } from 'env-var';
import { LangEnum } from '../enums/language-code.enum';

export type authStrategiesType = 'phone' | 'email' | 'email-phone';
export type ProjectConfigTypeMailType = [
  'NodemailerMailStrategy',
  'AwsMailStrategy',
];
export type ProjectConfigTypeUploaderType = [
  'S3StorageStrategy',
  'LocalStorageStrategy',
];

export type UploaderS3ConfigType = {
  bucketName: string;
  region: string;
  secretKey: string;
  accessKey: string;
  urlExpiration: number;
};
export type UploaderDefaultConfigType = { storagePath: string };

export type MailerConfigType = {
  host: string;
  mail: string;
  port?: number;
  password: string;
  account: string;
};
export type AwsMailerConfigType = {
  region: string;
  secretKey: string;
  accessKey: string;
  account: string;
};

export interface IMailerPluginType extends MailerConfigType {
  provider: ProjectConfigTypeMailType['0'];
}
export interface IMailAwsPluginType extends AwsMailerConfigType {
  provider: ProjectConfigTypeMailType['1'];
}

export interface IS3PluginType extends UploaderS3ConfigType {
  provider: ProjectConfigTypeUploaderType['0'];
}
export interface IDefaultStoragePluginType extends UploaderDefaultConfigType {
  provider: ProjectConfigTypeUploaderType['1'];
}
export declare class ProjectConfigType {
  environment: typeof process.env.NODE_ENV;
  defaultLanguage: LangEnum;
  authentication: {
    JWT_SECRET: string;
    accountVerified: boolean;
    authStrategy: authStrategiesType;
    authRole: Partial<{ [key in UserRoleEnum]: authStrategiesType }>;
  };
  name: string;
  serverUrl: string;
  emailPlugin: IMailerPluginType | IMailAwsPluginType;
  uploaderPlugin: IDefaultStoragePluginType | IS3PluginType;
}

export function createConfig(
  config: Omit<ProjectConfigType, 'emailPlugin' | 'uploaderPlugin'> & {
    emailPlugin: ProjectConfigTypeMailType[number];
    uploaderPlugin: ProjectConfigTypeUploaderType[number];
  },
): ProjectConfigType {
  const getStorageConfig = (
    provider: ProjectConfigTypeUploaderType[number],
  ): IS3PluginType | IDefaultStoragePluginType => {
    return provider === 'S3StorageStrategy'
      ? {
          provider,
          region: get('S3_REGION').required().asString(),
          bucketName: get('S3_BUCKET_NAME').required().asString(),
          secretKey: get('S3_SECRET_ACCESS_KEY').required().asString(),
          accessKey: get('S3_ACCESS_KEY_ID').required().asString(),
          urlExpiration: get('URL_EXPIRES_IN').required().asInt(),
        }
      : {
          provider,
          storagePath: 'public/storage',
        };
  };

  const getMailConfig = (
    provider: ProjectConfigTypeMailType[number],
  ): IMailerPluginType | IMailAwsPluginType => {
    return provider === 'AwsMailStrategy'
      ? {
          provider,
          region: get('SES_REGION').asString(),
          secretKey: get('SES_SECRET_ACCESS_KEY').asString(),
          accessKey: get('SES_ACCESS_KEY_ID').asString(),
          account: get('MAIL').asString(),
        }
      : {
          provider,
          host: get('MAIL_HOST').asString(),
          password: get('AUTOMATED_PASSWORD').asString(),
          mail: get('AUTOMATED_MAIL').asString(),
          account: get('AUTOMATED_MAIL').asString(),
        };
  };

  return {
    ...config,
    emailPlugin: getMailConfig(config.emailPlugin),
    uploaderPlugin: getStorageConfig(config.uploaderPlugin),
  };
}
