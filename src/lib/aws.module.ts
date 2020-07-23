import { Module, DynamicModule } from '@nestjs/common';
import { AwsServiceFactory } from './aws-service.factory';
import {
  AwsService,
  AwsServiceType,
  AwsServiceConfigurationOptionsFactoryProvider,
  AwsServiceWithServiceOptions,
} from './types';
import { createAwsServiceProvider } from './aws-service-provider.factory';
import { createAwsServiceConfigurationOptionsProvider } from './aws-service-configuration-options-provider.factory';

@Module({})
export class AwsSdkModule {
  static forRoot(options?: {
    defaultServiceOptions?: AwsServiceConfigurationOptionsFactoryProvider;
  }): DynamicModule {
    const module: DynamicModule = {
      global: true,
      module: AwsSdkModule,
      imports: [],
      providers: [AwsServiceFactory],
      exports: [AwsServiceFactory],
    };

    if (!options?.defaultServiceOptions) {
      return module;
    }

    const serviceOptionsProvider = createAwsServiceConfigurationOptionsProvider(
      options?.defaultServiceOptions,
    );

    if (serviceOptionsProvider.imports.length) {
      serviceOptionsProvider.imports.forEach(i => module.imports.push(i));
    }

    if (serviceOptionsProvider.exports.length) {
      serviceOptionsProvider.exports.forEach(i => module.exports.push(i));
    }

    if (serviceOptionsProvider.provider) {
      module.providers.push(serviceOptionsProvider.provider);
    }

    return module;
  }

  static forFeatures(
    services: Array<AwsServiceType<AwsService> | AwsServiceWithServiceOptions>,
  ): DynamicModule {
    const providers = services?.map(s => createAwsServiceProvider(s)) ?? [];

    const module: DynamicModule = {
      module: AwsSdkModule,
      providers: [...providers, AwsServiceFactory],
      exports: [...providers, AwsServiceFactory],
    };

    return module;
  }
}
