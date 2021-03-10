import { Injectable, Module } from '@nestjs/common';
import {
  InjectAwsService,
  AwsSdkModule,
  AwsServiceFactory,
  InjectAwsDefaultOptions,
} from '../src';
import { S3, SharedIniFileCredentials, CloudFront } from 'aws-sdk';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import { NestFactory } from '@nestjs/core';

@Injectable()
class AppService {
  constructor(
    @InjectAwsService(S3) readonly s3: S3,
    @InjectAwsService(CloudFront) readonly cloudFront: CloudFront,
    @InjectAwsDefaultOptions() readonly options: ServiceConfigurationOptions,
    readonly factory: AwsServiceFactory,
  ) {}
}

@Module({
  imports: [
    AwsSdkModule.forRoot({
      defaultServiceOptions: {
        credentials: new SharedIniFileCredentials({
          profile: 'personal',
        }),
      },
      services: [
        S3,
        {
          service: CloudFront,
          serviceOptions: {
            credentials: new SharedIniFileCredentials({
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
