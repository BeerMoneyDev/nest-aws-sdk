import { Injectable, Module } from '@nestjs/common';
import {
  InjectAwsService,
  AwsSdkModule,
  InjectAwsDefaultOptions,
  AwsServiceFactory,
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

@Injectable()
class ConfigService {
  getProfile() {
    return new SharedIniFileCredentials({
      profile: 'kerryritter',
    });
  }
}

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
class ConfigModule {}

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
        useFactory: (cs: ConfigService) => {
          return {
            credentials: cs.getProfile(),
          };
        },
        imports: [ConfigModule],
        inject: [ConfigService],
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
        useFactory: (cs: ConfigService) => {
          return {
            credentials: cs.getProfile(),
          };
        },
        imports: [ConfigModule],
        inject: [ConfigService],
      },
    }),
    AwsSdkModule.forFeatures([S3]),
  ],
  providers: [AppService],
  exports: [],
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
    expect((service.s3.config.credentials as any).profile).toBe('kerryritter');

    expect(service.options).toBeDefined();
    expect((service.options.credentials as any).profile).toBe('kerryritter');

    expect(service.factory).toBeDefined();
  });

  it('it should inject S3 into a service (with submodule)', async () => {
    const module = await NestFactory.createApplicationContext(
      AppRootModule,
      {
        logger: false,
      },
    );

    const service = module.get(AppService);

    expect(service.s3).toBeDefined();
    expect((service.s3.config.credentials as any).profile).toBe('kerryritter');

    expect(service.options).toBeDefined();
    expect((service.options.credentials as any).profile).toBe('kerryritter');

    expect(service.factory).toBeDefined();
  });
});