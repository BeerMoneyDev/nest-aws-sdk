import { FactoryProvider } from '@nestjs/common';
import {
  getAwsServiceToken,
  AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN,
} from './tokens';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import {
  AwsService,
  AwsServiceType,
  AwsServiceConfigurationOptionsFactory,
} from './types';
import { AwsServiceFactory } from './aws-service.factory';

export function createAwsServiceProvider(
  service: AwsServiceType<AwsService>,
): FactoryProvider<AwsService> {
  return {
    provide: getAwsServiceToken(service),
    useFactory: (
      serviceFactory: AwsServiceFactory,
      optionsFactory: AwsServiceConfigurationOptionsFactory,
    ) => {
      const defaultServiceOptions: Partial<ServiceConfigurationOptions> =
        optionsFactory && typeof optionsFactory === 'function'
          ? (optionsFactory() as any)
          : optionsFactory;

      return serviceFactory.create(service, defaultServiceOptions);
    },
    inject: [
      AwsServiceFactory,
      AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN,
    ],
  };
}
