import { CloudFront } from '@aws-sdk/client-cloudfront';
import { S3 } from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { Credentials, Provider } from '@aws-sdk/types';
import { Injectable, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  AwsSdkModule,
  AwsServiceFactory,
  AwsServiceInputConfig,
  InjectAwsDefaultOptions,
  InjectAwsService,
} from '../src';

@Injectable()
class AppService {
  constructor(
    @InjectAwsService(S3) readonly s3: S3,
    @InjectAwsService(CloudFront) readonly cloudFront: CloudFront,
    @InjectAwsDefaultOptions() readonly options: AwsServiceInputConfig,
    readonly factory: AwsServiceFactory,
  ) {
  }
}

@Module({
  imports: [
    AwsSdkModule.forRoot({
      defaultServiceOptions: {
        credentials: fromIni({
          profile: 'kerryritter',
        }),
      },
      services: [
        S3,
        {
          service: CloudFront,
          serviceOptions: {
            credentials: fromIni({
              profile: 'kerryritter2',
            }),
          },
        },
      ],
    }),
  ],
  providers: [AppService],
})
class AppRootModule {
}

type AwsServiceConfig = {
  credentials: Provider<Credentials>
};

type AwsService = {
  config: AwsServiceConfig
};

describe('AwsSdkModule forRoot with services registration', () => {
  it('it should inject S3 into a test service', async () => {
    const module = await NestFactory.createApplicationContext(
      AppRootModule,
      {
        logger: false,
      },
    );


    const service = module.get(AppService) as AppService & {
      s3: AwsService;
      cloudFront: AwsService;
      options: AwsServiceConfig
    };

    expect(service.s3).toBeDefined();
    expect((await service.s3.config.credentials()).accessKeyId).toBeDefined();

    expect(service.cloudFront).toBeDefined();
    expect((await service.cloudFront.config.credentials()).accessKeyId).toBeDefined();

    expect(service.options).toBeDefined();
    expect((await service.options.credentials()).accessKeyId).toBeDefined();

    expect(service.factory).toBeDefined();
  });
});
