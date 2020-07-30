import { Module, DynamicModule } from '@nestjs/common';
import { AwsServiceFactory } from './aws-service.factory';
import {
  AwsService,
  AwsServiceType,
  AwsServiceConfigurationOptionsFactoryProvider,
  AwsServiceWithServiceOptions,
  AwsServiceConfigurationOptionsFactory,
} from './types';
import { createAwsServiceProvider } from './aws-service-provider.factory';
import { createAwsServiceConfigurationOptionsProvider } from './aws-service-configuration-options-provider.factory';

@Module({})
export class AwsSdkModule {
  static forRoot(options?: {
    defaultServiceOptions?: AwsServiceConfigurationOptionsFactory;
    services?: Array<AwsServiceType<AwsService> | AwsServiceWithServiceOptions>,
  }) {
    if (!options) {
      return AwsSdkModule.forRootAsync();
    }

    return AwsSdkModule.forRootAsync({
      defaultServiceOptions: options.defaultServiceOptions
        ? { useValue: options.defaultServiceOptions }
        : null,
      services: options.services,
    });
  }

  static forRootAsync(options?: {
    defaultServiceOptions?: AwsServiceConfigurationOptionsFactoryProvider;
    services?: Array<AwsServiceType<AwsService> | AwsServiceWithServiceOptions>,
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

    const serviceProviders = options.services?.map(s => createAwsServiceProvider(s)) ?? [];
    if (serviceProviders.length) {
      serviceProviders.forEach(sp => {
        // console.log('PROVIDE', { sp })
        module.providers.push(sp);
        module.exports.push(sp.provide);
      });
    }

    return module;
  }

  static forFeatures(
    services: Array<AwsServiceType<AwsService> | AwsServiceWithServiceOptions>,
  ): DynamicModule {
    const serviceProviders = services?.map(s => createAwsServiceProvider(s)) ?? [];

    const module: DynamicModule = {
      module: AwsSdkModule,
      providers: [...serviceProviders, AwsServiceFactory],
      exports: [...serviceProviders, AwsServiceFactory],
    };

    return module;
  }
}
