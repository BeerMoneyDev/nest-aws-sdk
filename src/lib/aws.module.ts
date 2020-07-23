import { Module, DynamicModule } from '@nestjs/common';
import { AwsServiceFactory } from './aws-service.factory';
import {
  AwsService,
  AwsServiceType,
  AwsServiceConfigurationOptionsFactoryProvider,
} from './types';
import { createAwsServiceProvider } from './aws-service-provider.factory';
import { createAwsServiceConfigurationOptionsProvider } from './aws-service-configuration-options-provider.factory';

@Module({})
export class AwsSdkModule {
  static forRoot(options?: {
    defaultServiceOptions?: AwsServiceConfigurationOptionsFactoryProvider;
  }): DynamicModule {
    const serviceOptionsProvider = createAwsServiceConfigurationOptionsProvider(
      options?.defaultServiceOptions,
    );

    const module: DynamicModule = {
      global: true,
      module: AwsSdkModule,
      imports: [...serviceOptionsProvider.exports],
      providers: [AwsServiceFactory, serviceOptionsProvider.provider],
      exports: [AwsServiceFactory, ...serviceOptionsProvider.exports],
    };

    return module;
  }

  static forFeatures(
    services: Array<AwsServiceType<AwsService>>,
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
