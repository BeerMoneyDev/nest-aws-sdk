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
    @InjectAwsDefaultOptions() readonly options: AwsServiceInputConfig,
    readonly factory: AwsServiceFactory,
  ) {
  }
}

@Module({
  imports: [AwsSdkModule.forFeatures([S3])],
  providers: [AppService],
  exports: [AppService],
})
class AppSubModule {
}

@Module({
  imports: [
    AppSubModule,
    AwsSdkModule.forRootAsync({
      defaultServiceOptions: {
        useValue: {
          credentials: fromIni({ profile: 'kerryritter' }),
        },
      },
    }),
  ],
  providers: [],
  exports: [],
})
class AppRootModule {
}

@Module({
  imports: [
    AwsSdkModule.forRootAsync({
      defaultServiceOptions: {
        useValue: {
          credentials: fromIni({
            profile: 'kerryritter',
          }),
        },
      },
    }),
    AwsSdkModule.forFeatures([S3]),
  ],
  providers: [AppService],
})
class AppRootNoSubModule {
}

type AwsServiceConfig = {
  credentials: Provider<Credentials>
};

type AwsService = {
  config: AwsServiceConfig
};

describe('AwsSdkModule forRootAsync with useFactory', () => {
  it('it should inject S3 into a service (root module only)', async () => {
    const module = await NestFactory.createApplicationContext(
      AppRootNoSubModule,
      {
        logger: false,
      },
    );

    const service = module.get(AppService) as AppService & {
      s3: AwsService
      options: AwsServiceConfig
    };

    expect(service.s3).toBeDefined();
    expect((await service.s3.config.credentials()).accessKeyId).toBeDefined();

    expect(service.options).toBeDefined();
    expect((await service.options.credentials()).accessKeyId).toBeDefined();

    expect(service.factory).toBeDefined();
  });

  it('it should inject S3 into a service (with submodule)', async () => {
    const module = await NestFactory.createApplicationContext(
      AppRootModule,
      {
        logger: false,
      },
    );

    const service = module.get(AppService) as AppService & {
      s3: AwsService
      options: AwsServiceConfig
    };

    expect(service.s3).toBeDefined();
    expect((await service.s3.config.credentials()).accessKeyId).toBeDefined();

    expect(service.options).toBeDefined();
    expect((await service.options.credentials()).accessKeyId).toBeDefined();

    expect(service.factory).toBeDefined();
  });
});
