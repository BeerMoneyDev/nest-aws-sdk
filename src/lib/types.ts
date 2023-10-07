import { S3ClientConfigType } from '@aws-sdk/client-s3';
import { CloudFrontClientConfigType } from '@aws-sdk/client-cloudfront';
import { DynamicModule, ValueProvider, FactoryProvider } from '@nestjs/common';

export interface AsyncModuleFactoryProvider<T>
  extends Omit<FactoryProvider<T>, 'provide'>,
    Pick<DynamicModule, 'imports'> {}

export type AsyncModuleValueProvider<T> = Omit<ValueProvider<T>, 'provide'>;

export type AsyncModuleProvider<T> =
  | AsyncModuleFactoryProvider<T>
  | AsyncModuleValueProvider<T>;

export type ServiceConfigurationOptions = S3ClientConfigType &
  CloudFrontClientConfigType;

export type AwsClientConfigType =
  | S3ClientConfigType
  | CloudFrontClientConfigType;

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
