import '@libs/utils/dotenv';
import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Config } from '@src/configs/app/system.config';
import { UploaderS3ConfigType } from '../../types/system.config';
import { S3Module } from '../aws/s3';
import { File } from './entities/file.entity';
import { FileRepository } from './repositories/file.repository';
import { UploaderController } from './controllers/uploader.controller';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'presetJob',
    }),
    TypeOrmModule.forFeature([File]),
    Config.uploaderPlugin.provider === 'S3StorageStrategy'
      ? S3Module.forRoot({
          accessKeyId: (<UploaderS3ConfigType>Config.uploaderPlugin).accessKey,
          region: (<UploaderS3ConfigType>Config.uploaderPlugin).region,
          secretAccessKey: (<UploaderS3ConfigType>Config.uploaderPlugin)
            .secretKey,
        })
      : Object,
  ],

  providers: [FileRepository],
  controllers: [UploaderController],
})
export class UploaderModule {}
