import { Type, DynamicModule, ForwardReference, ClassProvider, ValueProvider, FactoryProvider } from '@nestjs/common';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';

interface ImportableClassProvider<T>
  extends ClassProvider<T>, Pick<DynamicModule, 'imports'> {
}

interface ImportableFactoryProvider<T>
  extends FactoryProvider<T>, Pick<DynamicModule, 'imports'> {
}

export type AsyncProvider<T> = Omit<ImportableClassProvider<T>, 'provide'>
  | Omit<ImportableFactoryProvider<T>, 'provide'>
  | Omit<ValueProvider<T>, 'provide'>;

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

export type AwsServiceConfigurationOptionsFactoryProvider =
  AsyncProvider<AwsServiceConfigurationOptionsFactory>;
