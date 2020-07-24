import {
  AppValueProviderModule,
  AppValueTestService,
  AppValueProviderWithSubModule,
} from './use-value-test-module';
import { NestFactory } from '@nestjs/core';
import {
  AppFactoryProviderModule,
  AppFactoryTestService,
  AppFactoryProviderWithSubModule,
} from './use-factory-test-module';

describe('AwsSdkModule', () => {
  it('it should inject S3 into a test service when using an options factory (single module)', async () => {
    const module = await NestFactory.createApplicationContext(
      AppFactoryProviderModule,
      {
        logger: false,
      },
    );

    const service = module.get(AppFactoryTestService);

    expect(service.s3).toBeDefined();
    expect((service.s3.config.credentials as any).profile).toBe('kerryritter');

    expect(service.options).toBeDefined();
    expect((service.options.credentials as any).profile).toBe('kerryritter');

    expect(service.factory).toBeDefined();
  });

  it('it should inject S3 into a test service when using an options factory (with submodule)', async () => {
    const module = await NestFactory.createApplicationContext(
      AppFactoryProviderWithSubModule,
      {
        logger: false,
      },
    );

    const service = module.get(AppFactoryTestService);

    expect(service.s3).toBeDefined();
    expect((service.s3.config.credentials as any).profile).toBe('kerryritter');

    expect(service.options).toBeDefined();
    expect((service.options.credentials as any).profile).toBe('kerryritter');

    expect(service.factory).toBeDefined();
  });

  it('it should inject S3 into a test service when using an options value (single module)', async () => {
    const module = await NestFactory.createApplicationContext(
      AppValueProviderModule,
      {
        logger: false,
      },
    );

    const service = module.get(AppValueTestService);

    expect(service.s3).toBeDefined();
    expect((service.s3.config.credentials as any).profile).toBe('kerryritter');

    expect(service.options).toBeDefined();
    expect((service.options.credentials as any).profile).toBe('kerryritter');

    expect(service.factory).toBeDefined();
  });

  it('it should inject S3 into a test service when using an options value (with submodule)', async () => {
    const module = await NestFactory.createApplicationContext(
      AppValueProviderWithSubModule,
      {
        logger: false,
      },
    );

    const service = module.get(AppValueTestService);

    expect(service.s3).toBeDefined();
    expect((service.s3.config.credentials as any).profile).toBe('kerryritter');

    expect(service.options).toBeDefined();
    expect((service.options.credentials as any).profile).toBe('kerryritter');

    expect(service.factory).toBeDefined();
  });
});
