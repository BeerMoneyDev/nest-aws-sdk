import { fromIni } from '@aws-sdk/credential-providers';
import { Injectable, Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { NestFactory } from '@nestjs/core';

import {
  AwsSdkModule,
  InjectAwsService,
  AwsServiceFactory,
  InjectAwsDefaultOptions,
  ServiceConfigurationOptions,
} from '../src';

@Injectable()
class AppValueProviderForRootTestService {
  constructor(
    @InjectAwsService(S3Client) readonly s3: S3Client,
    @InjectAwsDefaultOptions() readonly options: ServiceConfigurationOptions,
    readonly factory: AwsServiceFactory,
  ) {}
}

@Module({
  imports: [AwsSdkModule.forFeatures([S3Client])],
  providers: [AppValueProviderForRootTestService],
  exports: [AppValueProviderForRootTestService],
})
class AppSubModule {}

@Module({
  imports: [
    AppSubModule,
    AwsSdkModule.forRoot({
      defaultServiceOptions: {
        credentials: fromIni({
          profile: 'personal',
        }),
      },
    }),
  ],
  providers: [],
  exports: [],
})
class AppRootModule {}

@Module({
  imports: [
    AwsSdkModule.forRoot({
      defaultServiceOptions: {
        credentials: fromIni({
          profile: 'personal',
        }),
      },
    }),
    AwsSdkModule.forFeatures([S3Client]),
  ],
  providers: [AppValueProviderForRootTestService],
})
class AppRootNoSubModule {}

describe('AwsSdkModule forRoot', () => {
  it('it should inject S3 into a service (root module only)', async () => {
    const module = await NestFactory.createApplicationContext(
      AppRootNoSubModule,
      {
        logger: false,
      },
    );

    const service = module.get(AppValueProviderForRootTestService);

    expect(service.s3).toBeDefined();
    expect((service.s3.config.credentials as any).profile).toBe('personal');

    expect(service.options).toBeDefined();
    expect((service.options.credentials as any).profile).toBe('personal');

    expect(service.factory).toBeDefined();
  });

  it('it should inject S3 into a service (with submodule)', async () => {
    const module = await NestFactory.createApplicationContext(AppRootModule, {
      logger: false,
    });

    const service = module.get(AppValueProviderForRootTestService);

    expect(service.s3).toBeDefined();
    expect((service.s3.config.credentials as any).profile).toBe('personal');

    expect(service.options).toBeDefined();
    expect((service.options.credentials as any).profile).toBe('personal');

    expect(service.factory).toBeDefined();
  });
});
