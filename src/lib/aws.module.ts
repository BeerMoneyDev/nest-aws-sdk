import { Module, DynamicModule } from '@nestjs/common';
import { AwsServiceFactory } from './aws-service.factory';
import {
  AwsService,
  AwsServiceType,
  AwsServiceWithServiceOptions,
  AwsServiceConfigurationOptionsFactory,
  AsyncModuleProvider,
} from './types';
import { createAwsServiceProvider } from './aws-service-provider.factory';
import { createExportableProvider } from './module-utils';
import { AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN } from './tokens';

@Module({})
export class AwsSdkModule {
  static forRoot(options?: {
    defaultServiceOptions?: AwsServiceConfigurationOptionsFactory;
    services?: Array<AwsServiceType<AwsService> | AwsServiceWithServiceOptions>;
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
    defaultServiceOptions?: AsyncModuleProvider<
      AwsServiceConfigurationOptionsFactory
    >;
    services?: Array<AwsServiceType<AwsService> | AwsServiceWithServiceOptions>;
  }): DynamicModule {
    if (!options) {
      options = {};
    }
    if (!options?.defaultServiceOptions) {
      options.defaultServiceOptions = {
        useValue: {},
      };
    }

    const module: DynamicModule = {
      global: true,
      module: AwsSdkModule,
      imports: [],
      providers: [AwsServiceFactory],
      exports: [AwsServiceFactory],
    };

    const serviceOptionsProvider = createExportableProvider(
      AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN,
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

    const serviceProviders =
      options.services?.map(s => createAwsServiceProvider(s)) ?? [];
    if (serviceProviders.length) {
      serviceProviders.forEach(sp => {
        module.providers.push(sp);
        module.exports.push(sp.provide);
      });
    }

    return module;
  }

  static forFeatures(
    services: Array<AwsServiceType<AwsService> | AwsServiceWithServiceOptions>,
  ): DynamicModule {
    const serviceProviders =
      services?.map(s => createAwsServiceProvider(s)) ?? [];

    const module: DynamicModule = {
      module: AwsSdkModule,
      providers: [...serviceProviders, AwsServiceFactory],
      exports: [...serviceProviders, AwsServiceFactory],
    };

    return module;
  }
}
