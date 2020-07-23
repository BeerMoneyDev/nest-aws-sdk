import { Provider } from '@nestjs/common';
import { AwsServiceConfigurationOptionsFactoryProvider } from './types';
import { AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN } from './tokens';

export function createAwsServiceConfigurationOptionsProvider(
  defaultServiceOptions?: AwsServiceConfigurationOptionsFactoryProvider,
): { provider: Provider<any>; exports: any[]; imports: any[] } {
  const exports = [AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN];

  if (defaultServiceOptions?.useFactory) {
    const provider: Provider<any> = {
      provide: AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN,
      useFactory: defaultServiceOptions.useFactory,
      inject: defaultServiceOptions.inject,
    };
    return {
      provider,
      exports,
      imports: defaultServiceOptions?.imports?.length
        ? [...defaultServiceOptions.imports]
        : [],
    };
  } else if (defaultServiceOptions?.useValue) {
    const provider: Provider<any> = {
      provide: AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN,
      useValue: defaultServiceOptions.useValue,
    };
    return { provider, exports, imports: [] };
  }

  return { provider: null, exports: [], imports: [] };
}
