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
class AppValueProviderForRootTestService {
  constructor(
    @InjectAwsService(S3) readonly s3: S3,
    @InjectAwsDefaultOptions() readonly options: ServiceConfigurationOptions,
    readonly factory: AwsServiceFactory,
  ) {}
}

@Module({
  imports: [AwsSdkModule.forRoot(), AwsSdkModule.forFeatures([S3])],
  providers: [AppValueProviderForRootTestService],
})
class AppRootModule {}

fdescribe('AwsSdkModule forRoot no default service options', () => {
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
