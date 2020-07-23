import { FactoryProvider } from '@nestjs/common';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import { AwsServiceFactory } from './aws-service.factory';
import {
  getAwsServiceToken,
  AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN,
} from './tokens';
import {
  AwsService,
  AwsServiceType,
  AwsServiceConfigurationOptionsFactory,
  AwsServiceWithServiceOptions,
} from './types';

export function createAwsServiceProvider(
  serviceDetails: AwsServiceType<AwsService> | AwsServiceWithServiceOptions,
): FactoryProvider<AwsService> {
  let service: AwsServiceType<AwsService>;
  let serviceOptionsOverride: AwsServiceConfigurationOptionsFactory;

  const asWithOptions = serviceDetails as AwsServiceWithServiceOptions;
  if (asWithOptions.service) {
    service = asWithOptions.service;
    serviceOptionsOverride = asWithOptions.serviceOptions;
  } else {
    service = serviceDetails as AwsServiceType<AwsService>;
  }

  return {
    provide: getAwsServiceToken(service),
    useFactory: (
      serviceFactory: AwsServiceFactory,
      optionsFactory: AwsServiceConfigurationOptionsFactory,
    ) => {
      const optionsFactoryToUse = serviceOptionsOverride
        ? serviceOptionsOverride
        : optionsFactory;

      const defaultServiceOptions: Partial<ServiceConfigurationOptions> =
        optionsFactoryToUse && typeof optionsFactoryToUse === 'function'
          ? (optionsFactoryToUse() as any)
          : optionsFactoryToUse;

      return serviceFactory.create(service, defaultServiceOptions);
    },
    inject: [
      AwsServiceFactory,
      AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN,
    ],
  };
}
