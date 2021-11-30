import { DynamicModule, ValueProvider, FactoryProvider } from '@nestjs/common';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';

export interface AsyncModuleFactoryProvider<T>
  extends Omit<FactoryProvider<T>, 'provide'>,
    Pick<DynamicModule, 'imports'> {}

export type AsyncModuleValueProvider<T> = Omit<ValueProvider<T>, 'provide'>;

export type AsyncModuleProvider<T> =
  | AsyncModuleFactoryProvider<T>
  | AsyncModuleValueProvider<T>;

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
