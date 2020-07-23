import { Injectable, Inject, Optional } from '@nestjs/common';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import {
  AwsServiceConfigurationOptionsFactory,
  AwsService,
  AwsServiceType,
} from './types';
import { AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN } from './tokens';

@Injectable()
export class AwsServiceFactory {
  constructor(
    @Inject(AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN)
    readonly serviceConfigurationOptions: AwsServiceConfigurationOptionsFactory,
  ) {}

  create(
    serviceConstructor: AwsServiceType<AwsService>,
    overrideServiceOptions?: ServiceConfigurationOptions,
  ) {
    const defaultServiceOptions =
      this.serviceConfigurationOptions &&
      typeof this.serviceConfigurationOptions === 'function'
        ? this.serviceConfigurationOptions()
        : this.serviceConfigurationOptions;

    return new serviceConstructor({
      ...(defaultServiceOptions ?? {}),
      ...(overrideServiceOptions ?? {}),
    });
  }
}
