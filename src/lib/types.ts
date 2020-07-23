import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import { Type, DynamicModule, ForwardReference } from '@nestjs/common';

export interface AwsServiceType<AwsService> {
  new (options: ServiceConfigurationOptions): AwsService;
}

export type AwsService = any;

export type AwsServiceWithServiceOptions = {
  service: AwsServiceType<AwsService>;
  serviceOptions: AwsServiceConfigurationOptionsFactory;
};

export type AwsServiceConfigurationOptionsFactory =
  | Partial<ServiceConfigurationOptions>
  | (() => Partial<ServiceConfigurationOptions>);

export interface AwsServiceConfigurationOptionsFactoryProvider {
  useFactory?: (...args: any[]) => AwsServiceConfigurationOptionsFactory;
  useValue?: AwsServiceConfigurationOptionsFactory;
  inject?: any[];
  imports?: Array<
    Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference
  >;
}
