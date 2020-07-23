import { Test, TestingModule } from '@nestjs/testing';
import { Injectable, Module, Optional } from '@nestjs/common';
import { AwsSdkModule, InjectAwsService, AwsServiceFactory } from '../src';
import { S3, SharedIniFileCredentials } from 'aws-sdk';
import { NestFactory } from '@nestjs/core';

@Injectable()
class TestService {
  constructor(
    @InjectAwsService(S3)
    @Optional()
    readonly s3: S3,
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
  imports: [
    AwsSdkModule.forFeatures([S3]),
  ],
  providers: [TestService],
  exports: [TestService],
})
class AppSubModule {}

@Module({
  imports: [
    AppSubModule,
    AwsSdkModule.forRoot({
      global: true,
      defaultServiceOptions: {
        useValue: {
          credentials: new SharedIniFileCredentials({
            profile: 'kerryritter'
          }),
        },
      },
    }),
  ],
  providers: [],
  exports: [],
})
class AppValueProviderModule {}


describe('AwsSdkModule', () => {
  it('it should inject S3 into a test service when using an options value', async () => {
    const module = await NestFactory.createApplicationContext(AppValueProviderModule);

    const service = module.get(TestService);

    expect(service.s3).toBeDefined();
    expect((service.s3.config.credentials as any).profile).toBe('kerryritter');
  });
});
