import { CloudFrontClient } from '@aws-sdk/client-cloudfront';
import { fromIni } from '@aws-sdk/credential-providers';
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
class AppService {
  constructor(
    @InjectAwsService(S3Client) readonly s3: S3Client,
    @InjectAwsService(CloudFrontClient) readonly cloudFront: CloudFrontClient,
    @InjectAwsDefaultOptions() readonly options: AwsClientConfigType,
    readonly factory: AwsServiceFactory,
  ) {}
}

@Module({
  imports: [
    AwsSdkModule.forRoot({
      defaultServiceOptions: {
        credentials: fromIni({
          profile: 'personal',
        }),
      },
      services: [
        S3Client,
        {
          service: CloudFrontClient,
          serviceOptions: {
            credentials: fromIni({
              profile: 'personal2',
            }),
          },
        },
      ],
    }),
  ],
  providers: [AppService],
})
class AppRootModule {}

describe('AwsSdkModule forRoot with services registration', () => {
  it('it should inject S3 into a test service', async () => {
    const module = await NestFactory.createApplicationContext(AppRootModule, {
      logger: false,
    });

    const service = module.get(AppService);

    expect(service.s3).toBeDefined();
    expect((service.s3.config.credentials as any).profile).toBe('personal');

    expect(service.cloudFront).toBeDefined();
    expect((service.cloudFront.config.credentials as any).profile).toBe(
      'personal2',
    );

    expect(service.options).toBeDefined();
    expect((service.options.credentials as any).profile).toBe('personal');

    expect(service.factory).toBeDefined();
  });
});
