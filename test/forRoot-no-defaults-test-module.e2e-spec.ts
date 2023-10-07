import { Injectable, Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { NestFactory } from '@nestjs/core';

import {
  InjectAwsService,
  AwsSdkModule,
  AwsServiceFactory,
  InjectAwsDefaultOptions,
  AwsClientConfigType,
} from '../src';

@Injectable()
class AppValueProviderForRootTestService {
  constructor(
    @InjectAwsService(S3Client) readonly s3: S3Client,
    @InjectAwsDefaultOptions() readonly options: AwsClientConfigType,
    readonly factory: AwsServiceFactory,
  ) {}
}

@Module({
  imports: [AwsSdkModule.forRoot(), AwsSdkModule.forFeatures([S3Client])],
  providers: [AppValueProviderForRootTestService],
})
class AppRootModule {}

describe('AwsSdkModule forRoot no default service options', () => {
  it('it should inject S3 into a service', async () => {
    const module = await NestFactory.createApplicationContext(AppRootModule, {
      logger: false,
    });

    const service = module.get(AppValueProviderForRootTestService);

    expect(service.s3).toBeDefined();

    expect(service.options).toBeDefined();

    expect(service.factory).toBeDefined();
  });
});
