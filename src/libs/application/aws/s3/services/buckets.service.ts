import {
  AccelerateConfiguration,
  Bucket,
  CORSConfiguration,
  CreateBucketCommand,
  CreateBucketCommandInput,
  CreateBucketCommandOutput,
  DeleteBucketCommand,
  DeleteBucketCommandOutput,
  GetBucketTaggingCommand,
  GetBucketTaggingCommandOutput,
  ListBucketsCommand,
  ListBucketsCommandOutput,
  PutBucketAccelerateConfigurationCommand,
  PutBucketAccelerateConfigurationCommandOutput,
  PutBucketAclCommand,
  PutBucketAclCommandInput,
  PutBucketAclCommandOutput,
  PutBucketCorsCommand,
  PutBucketCorsCommandOutput,
  PutBucketEncryptionCommand,
  PutBucketEncryptionCommandInput,
  PutBucketEncryptionCommandOutput,
  PutBucketLoggingCommand,
  PutBucketLoggingCommandInput,
  PutBucketLoggingCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { BaseHttpException } from '@src/libs/application/exceptions/base-http-exception';
import { ErrorCodeEnum } from '@src/libs/application/exceptions/error-code.enum';
import { log } from 'console';
import { S3_SERVICE } from '../constants';

@Injectable()
export class BucketsService {
  public constructor(@Inject(S3_SERVICE) private readonly client: S3Client) {}

  public async create(
    bucket: string,
    options: Omit<CreateBucketCommandInput, 'Bucket'> = {},
  ): Promise<CreateBucketCommandOutput> {
    try {
      return await this.client.send(
        new CreateBucketCommand({
          Bucket: bucket,
          ...options,
        }),
      );
    } catch (error) {
      log(error);
      throw new BaseHttpException(ErrorCodeEnum.FILE_UPLOAD_IS_INVALID);
    }
  }

  public async delete(bucket: string): Promise<DeleteBucketCommandOutput> {
    try {
      return await this.client.send(
        new DeleteBucketCommand({
          Bucket: bucket,
        }),
      );
    } catch (error) {
      log(error);
      throw new BaseHttpException(ErrorCodeEnum.FILE_UPLOAD_IS_INVALID);
    }
  }

  public async list(): Promise<ListBucketsCommandOutput> {
    try {
      return await this.client.send(new ListBucketsCommand({}));
    } catch (error) {
      log(error);
      throw new BaseHttpException(ErrorCodeEnum.FILE_UPLOAD_IS_INVALID);
    }
  }

  public async find(bucket: string): Promise<Bucket | undefined> {
    try {
      const buckets = await this.client.send(new ListBucketsCommand({}));
      return buckets.Buckets.find((b) => b.Name === bucket);
    } catch (error) {
      log(error);
      throw new BaseHttpException(ErrorCodeEnum.FILE_UPLOAD_IS_INVALID);
    }
  }

  public async tagging(bucket: string): Promise<GetBucketTaggingCommandOutput> {
    try {
      return await this.client.send(
        new GetBucketTaggingCommand({
          Bucket: bucket,
        }),
      );
    } catch (error) {
      log(error);
      throw new BaseHttpException(ErrorCodeEnum.FILE_UPLOAD_IS_INVALID);
    }
  }

  public async updateCors(
    bucket: string,
    configuration: CORSConfiguration,
  ): Promise<PutBucketCorsCommandOutput> {
    try {
      return await this.client.send(
        new PutBucketCorsCommand({
          Bucket: bucket,
          CORSConfiguration: configuration,
        }),
      );
    } catch (error) {
      log(error);
      throw new BaseHttpException(ErrorCodeEnum.FILE_UPLOAD_IS_INVALID);
    }
  }

  public async updateAcl(
    bucket: string,
    configuration: Omit<PutBucketAclCommandInput, 'Bucket'>,
  ): Promise<PutBucketAclCommandOutput> {
    try {
      return await this.client.send(
        new PutBucketAclCommand({
          Bucket: bucket,
          ...configuration,
        }),
      );
    } catch (error) {
      log(error);
      throw new BaseHttpException(ErrorCodeEnum.FILE_UPLOAD_IS_INVALID);
    }
  }

  public async updateLogging(
    bucket: string,
    configuration: Omit<PutBucketLoggingCommandInput, 'Bucket'>,
  ): Promise<PutBucketLoggingCommandOutput> {
    try {
      return await this.client.send(
        new PutBucketLoggingCommand({
          Bucket: bucket,
          ...configuration,
        }),
      );
    } catch (error) {
      log(error);
      throw new BaseHttpException(ErrorCodeEnum.FILE_UPLOAD_IS_INVALID);
    }
  }

  public async updateEncryption(
    bucket: string,
    configuration: Omit<PutBucketEncryptionCommandInput, 'Bucket'>,
  ): Promise<PutBucketEncryptionCommandOutput> {
    try {
      return await this.client.send(
        new PutBucketEncryptionCommand({
          Bucket: bucket,
          ...configuration,
        }),
      );
    } catch (error) {
      log(error);
      throw new BaseHttpException(ErrorCodeEnum.FILE_UPLOAD_IS_INVALID);
    }
  }

  public async updateAccelerateConfiguration(
    bucket: string,
    configuration: AccelerateConfiguration,
  ): Promise<PutBucketAccelerateConfigurationCommandOutput> {
    try {
      return await this.client.send(
        new PutBucketAccelerateConfigurationCommand({
          Bucket: bucket,
          AccelerateConfiguration: configuration,
        }),
      );
    } catch (error) {
      log(error);
      throw new BaseHttpException(ErrorCodeEnum.FILE_UPLOAD_IS_INVALID);
    }
  }
}
