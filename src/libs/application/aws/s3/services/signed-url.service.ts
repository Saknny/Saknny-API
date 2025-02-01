import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Injectable } from '@nestjs/common';
import { BaseHttpException } from '@src/libs/application/exceptions/base-http-exception';
import { ErrorCodeEnum } from '@src/libs/application/exceptions/error-code.enum';
import { log } from 'console';
import { DEFAULT_EXPIRES_IN, S3_SERVICE } from '../constants';
import { prepareOptions } from '../helpers';
import {
  DeleteObjectOptions,
  DeleteObjectsOptions,
  GetObjectOptions,
  PutObjectOptions,
  PutSignedUrl,
} from '../types';
import { PrefixService } from './prefix.service';

@Injectable()
export class SignedUrlService {
  public constructor(
    @Inject(S3_SERVICE) private readonly client: S3Client,
    private readonly prefixService: PrefixService,
  ) {}

  async getPutSignedUrl(
    bucket: string,
    remote: string,
    expiresIn: number = DEFAULT_EXPIRES_IN,
    options?: PutObjectOptions,
  ): Promise<PutSignedUrl> {
    const {
      disableAutoPrefix,
      prefixContext,
      options: preparedOptions,
    } = prepareOptions(options);
    const key = disableAutoPrefix
      ? remote
      : this.prefixService.prefix(remote, bucket, prefixContext);
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ...preparedOptions,
      });

      const preSignedUrl = await getSignedUrl(this.client, command, {
        expiresIn,
      });

      return {
        url: preSignedUrl,
        remote: key,
      };
    } catch (error) {
      log(error);
      throw new BaseHttpException(ErrorCodeEnum.FILE_UPLOAD_IS_INVALID);
    }
  }

  async getSignedUrl(
    bucket: string,
    remote: string,
    expiresIn: number = DEFAULT_EXPIRES_IN,
    options?: GetObjectOptions,
  ): Promise<string> {
    const {
      disableAutoPrefix,
      prefixContext,
      options: preparedOptions,
    } = prepareOptions(options);
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: disableAutoPrefix
          ? remote
          : this.prefixService.prefix(remote, bucket, prefixContext),
        ...preparedOptions,
      });

      return await getSignedUrl(this.client, command, {
        expiresIn,
      });
    } catch (error) {
      log(error);
      throw new BaseHttpException(ErrorCodeEnum.FILE_UPLOAD_IS_INVALID);
    }
  }

  async getDeleteSignedUrl(
    bucket: string,
    remote: string,
    expiresIn: number = DEFAULT_EXPIRES_IN,
    options?: DeleteObjectOptions,
  ): Promise<string> {
    const {
      disableAutoPrefix,
      prefixContext,
      options: preparedOptions,
    } = prepareOptions(options);

    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: disableAutoPrefix
          ? remote
          : this.prefixService.prefix(remote, bucket, prefixContext),
        ...preparedOptions,
      });

      return await getSignedUrl(this.client, command, {
        expiresIn,
      });
    } catch (error) {
      log(error);
      throw new BaseHttpException(ErrorCodeEnum.FILE_UPLOAD_IS_INVALID);
    }
  }

  async getDeleteObjectsSignedUrl(
    bucket: string,
    remotes: string[],
    expiresIn: number = DEFAULT_EXPIRES_IN,
    options?: DeleteObjectsOptions,
  ): Promise<string> {
    const {
      disableAutoPrefix,
      prefixContext,
      options: preparedOptions,
    } = prepareOptions(options);

    try {
      const command = new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: remotes.map((r) => ({
            Key: disableAutoPrefix
              ? r
              : this.prefixService.prefix(r, bucket, prefixContext),
          })),
        },
        ...preparedOptions,
      });

      return await getSignedUrl(this.client, command, {
        expiresIn,
      });
    } catch (error) {
      log(error);
      throw new BaseHttpException(ErrorCodeEnum.FILE_UPLOAD_IS_INVALID);
    }
  }
}
