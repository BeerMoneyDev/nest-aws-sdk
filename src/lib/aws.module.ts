import {
  Module,
  Provider,
  DynamicModule,
  ValueProvider,
  FactoryProvider,
} from '@nestjs/common';
import { AwsServiceFactory } from './aws-service.factory';
import { getAwsServiceToken } from './aws-service.decorator';
import {
  AwsService,
  AwsServiceType,
  AwsServiceConfigurationOptionsFactoryProvider,
} from './types';
import { AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN } from './tokens';

@Module({})
export class AwsSdkModule {
  static forRoot(options?: {
    global?: boolean;
    defaultServiceOptions?: AwsServiceConfigurationOptionsFactoryProvider;
  }): DynamicModule {

    const module: DynamicModule = {
      imports: [],
      module: AwsSdkModule,
      global: options?.global,
      providers: [AwsServiceFactory,],
      exports: [AwsServiceFactory],
    };

    if (options?.defaultServiceOptions?.useFactory) {
      module.providers.push({
        provide: AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN,
        useFactory: options.defaultServiceOptions.useFactory,
        inject: options.defaultServiceOptions.inject,
      });
    } else if (options?.defaultServiceOptions?.useValue) {
      module.providers.push({
        provide: AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN,
        useValue: options.defaultServiceOptions.useValue,
      });
    } else {
      module.providers.push({
        provide: AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN,
        useValue: {},
      });
    }

    if (options?.defaultServiceOptions?.imports?.length) {
      module.imports = [
        ...module.imports,
        ...options.defaultServiceOptions.imports,
      ];
    }


    return module;
  }

  static forFeatures(
    services: Array<AwsServiceType<AwsService>>,
  ): DynamicModule {
    const providers =
      services?.map(s => this.createAwsServiceProvider(s)) ?? [];

    const module: DynamicModule = {
      module: AwsSdkModule,
      providers: [...providers],
      exports: [...providers],
    };


    return module;
  }

  private static createAwsServiceProvider(
    service: AwsServiceType<AwsService>,
  ): Provider<AwsService> {
    return {
      provide: getAwsServiceToken(service),
      useFactory: (serviceFactory: AwsServiceFactory) =>
        serviceFactory.create(service, null),
      inject: [AwsServiceFactory],
    };
  }
}
