import { Injectable, Module } from '@nestjs/common';
import {
  InjectAwsService,
  AwsSdkModule,
  AwsServiceFactory,
  InjectAwsDefaultOptions,
} from '../src';
import { S3, SharedIniFileCredentials } from 'aws-sdk';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import { NestFactory } from '@nestjs/core';

@Injectable()
class AppService {
  constructor(
    @InjectAwsService(S3) readonly s3: S3,
    @InjectAwsDefaultOptions() readonly options: ServiceConfigurationOptions,
    readonly factory: AwsServiceFactory,
  ) {}
}

@Module({
  imports: [AwsSdkModule.forFeatures([S3])],
  providers: [AppService],
  exports: [AppService],
})
class AppSubModule {}

@Module({
  imports: [
    AppSubModule,
    AwsSdkModule.forRootAsync({
      defaultServiceOptions: {
        useValue: {
          credentials: new SharedIniFileCredentials({
            profile: 'personal',
          }),
        },
      },
    }),
  ],
  providers: [],
  exports: [],
})
class AppRootModule {}

@Module({
  imports: [
    AwsSdkModule.forRootAsync({
      defaultServiceOptions: {
        useValue: {
          credentials: new SharedIniFileCredentials({
            profile: 'personal',
          }),
        },
      },
    }),
    AwsSdkModule.forFeatures([S3]),
  ],
  providers: [AppService],
})
class AppRootNoSubModule {}

describe('AwsSdkModule forRootAsync with useFactory', () => {
  it('it should inject S3 into a service (root module only)', async () => {
    const module = await NestFactory.createApplicationContext(
      AppRootNoSubModule,
      {
        logger: false,
      },
    );

    const service = module.get(AppService);

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

    const service = module.get(AppService);

    expect(service.s3).toBeDefined();
    expect((service.s3.config.credentials as any).profile).toBe('personal');

    expect(service.options).toBeDefined();
    expect((service.options.credentials as any).profile).toBe('personal');

    expect(service.factory).toBeDefined();
  });
});
