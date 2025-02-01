import { createConfig } from '../../libs/types/system.config';
import { get } from 'env-var';
import { env } from 'process';
import { LangEnum } from '../../libs/enums/language-code.enum';

export const Config = createConfig({
  name: env.BrandName || 'Saknny',
  defaultLanguage: LangEnum.EN,
  serverUrl: get('API_BASE_URL').asString(),
  authentication: {
    JWT_SECRET: env.JWT_SECRET || 'quf232%@hyHGW$#TGhd',
    accountVerified: false,
    authStrategy: 'email',
    authRole: {},
  },
  emailPlugin: 'NodemailerMailStrategy',
  uploaderPlugin: 'LocalStorageStrategy',
  environment: process.env.NODE_ENV || 'development',
});
